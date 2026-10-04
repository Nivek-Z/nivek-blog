import hljs from "highlight.js";
import { parseHTML } from "linkedom";

const WORD =
  /\p{Script=Han}|\p{Script=Kana}|\p{Script=Hira}|\p{Script=Hangul}|[\p{L}|\p{N}|._]+/gu;

const TOAST_COLOR = {
  NORMAL: "rgba(167, 210, 226, 1)",
  MEDIUM: "rgba(255, 197, 160, 1)",
  DIFFICULTY: "rgba(239, 206, 201, 1)",
} as const;

type ToastType = keyof typeof TOAST_COLOR;

const READ_REMIND: Record<ToastType, string> = {
  NORMAL: "文章篇幅适中，可以放心阅读。",
  MEDIUM: "文章篇幅较长，建议分段阅读。",
  DIFFICULTY: "文章内容已经很陈旧了，也许不再适用！",
};

const EDIT_REMIND: Record<ToastType, string> = {
  NORMAL: "近期有所更新，请放心阅读！",
  MEDIUM: "文章内容已经较久没有更新了，也许不再适用！",
  DIFFICULTY: "文章内容已经很陈旧了，也许不再适用！",
};

/** Sakura `I18nFormat.secondToTimeString` with zh.json `common.days/hours/minutes/seconds`. */
export function secondToTimeString(second: number) {
  let minutes = Math.floor(second / 60);
  let seconds = second % 60;
  let hours = Math.floor(minutes / 60);
  minutes %= 60;
  let days = Math.floor(hours / 24);
  hours %= 24;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0) parts.push(`${hours} 小时`);
  if (minutes > 0) parts.push(`${minutes} 分钟`);
  if (seconds > 0) parts.push(`${seconds} 秒`);
  return parts.join(" ");
}

/** Sakura `I18nFormat.RelativeTimeFormat` for locale `zh-CN`. */
export function relativeTime(timestamp: number, now = Date.now()) {
  const diffInSeconds = Math.round((now - timestamp) / 1000);
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { style: "long" });
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, "second");
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  if (diffInSeconds < 31104000) return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  return rtf.format(-Math.floor(diffInSeconds / 31104000), "year");
}

export function wordCountFromHtml(html: string) {
  const { document } = parseHTML(`<div id="root">${html}</div>`);
  const text = (document.getElementById("root")?.textContent || "").normalize();
  return text.match(WORD)?.length ?? 0;
}

function readType(seconds: number): ToastType {
  if (seconds <= 60 * 10) return "NORMAL";
  if (seconds <= 60 * 30) return "MEDIUM";
  return "DIFFICULTY";
}

function editType(elapsedMs: number): ToastType {
  const month = 1000 * 60 * 60 * 24 * 30;
  if (elapsedMs <= month) return "NORMAL";
  if (elapsedMs <= month * 3) return "MEDIUM";
  return "DIFFICULTY";
}

function toast(className: string, message: string, type: ToastType) {
  return `<div class="${className} minicode" style="background-color: ${TOAST_COLOR[type]}"><span class="content-toast">${message}</span><div class="hide-minicode flex-child-center"><span class="iconify iconify--small" data-icon="ic:sharp-close"></span></div></div>`;
}

/**
 * The two Sakura minicode notices, edit time then read time.
 * Reminders are the desktop copy (`window.innerWidth > 860`).
 */
export function readerNotices(html: string, lastModifyTime: string | null, now = Date.now()) {
  const parts: string[] = [];
  if (lastModifyTime) {
    const edited = Date.parse(lastModifyTime);
    if (!Number.isNaN(edited)) {
      const type = editType(now - edited);
      parts.push(
        toast(
          "last_time",
          `文章内容上次编辑时间于 <b>${relativeTime(edited, now)}</b>。${EDIT_REMIND[type]}`,
          type,
        ),
      );
    }
  }
  const count = wordCountFromHtml(html);
  if (count > 0) {
    const seconds = Math.ceil((count / 600) * 60);
    const type = readType(seconds);
    parts.push(
      toast(
        "word_count",
        `文章共 <b>${count}</b> 字，阅读完预计需要 <b> ${secondToTimeString(seconds)}</b>。${READ_REMIND[type]}`,
        type,
      ),
    );
  }
  return parts.join("");
}

const BREAK_LINE = /\r\n|\r|\n/g;

function getLines(text: string) {
  if (text.length === 0) return [];
  return text.split(BREAK_LINE);
}

function getLinesCount(text: string | null) {
  return ((text || "").trim().match(BREAK_LINE) || []).length;
}

function duplicateMultilineNode(element: Element) {
  const className = element.className;
  if (typeof className !== "string" || !/hljs-/.test(className)) return;
  const lines = getLines(element.innerHTML);
  let result = "";
  for (const line of lines) {
    result += `<span class="${className}">${line.length > 0 ? line : " "}</span>\n`;
  }
  element.innerHTML = result.trim();
}

function duplicateMultilineNodes(element: Element) {
  const nodes = [...element.childNodes];
  for (const node of nodes) {
    if (node.nodeType === 3) {
      if (getLinesCount(node.textContent) > 0 && node.parentElement) {
        duplicateMultilineNode(node.parentElement);
      }
      continue;
    }
    if (node.nodeType !== 1) continue;
    const el = node as Element;
    if (getLinesCount(el.textContent) > 0) {
      if (el.childNodes.length > 0) duplicateMultilineNodes(el);
      else duplicateMultilineNode(el);
    }
  }
}

function lineNumberTable(innerHtml: string) {
  const holder = parseHTML(`<code>${innerHtml}</code>`).document.querySelector("code");
  if (!holder) return innerHtml;
  duplicateMultilineNodes(holder);
  const lines = getLines(holder.innerHTML);
  if (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length <= 1) return holder.innerHTML;
  const rows = lines
    .map((line, index) => {
      const n = index + 1;
      const text = line.length > 0 ? line : " ";
      return `<tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="${n}"><div class="hljs-ln-n" data-line-number="${n}"></div></td><td class="hljs-ln-line hljs-ln-code" data-line-number="${n}">${text}</td></tr>`;
    })
    .join("");
  return `<table class="hljs-ln">${rows}</table>`;
}

function highlightCode(codeEl: Element) {
  let lang = "";
  for (const className of [...codeEl.classList]) {
    if (className.startsWith("language-")) lang = className.slice("language-".length);
  }
  const source = codeEl.textContent || "";
  if (!hljs.getLanguage(lang)) {
    if (lang) codeEl.classList.remove(`language-${lang}`);
    const auto = hljs.highlightAuto(source);
    lang = auto.language || "text";
    codeEl.classList.add(`language-${lang}`);
  }
  const language = hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(source, { language }).value;
  codeEl.setAttribute("data-rel", lang.toUpperCase());
  codeEl.classList.add(lang.toLowerCase());
  codeEl.classList.add("hljs");
  codeEl.innerHTML = lineNumberTable(highlighted);
}

/** highlight.js + Dracula classes, the way Sakura 2.4.3 `registerHighlight` does. */
export function decoratePostHtml(html: string) {
  if (!html.includes("<pre")) return html;
  const { document } = parseHTML(`<div id="root">${html}</div>`);
  const root = document.getElementById("root");
  if (!root) return html;
  root.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;
    pre.classList.add("highlight-wrap");
    pre.setAttribute("autocomplete", "off");
    pre.setAttribute("autocorrect", "off");
    pre.setAttribute("autocapitalize", "off");
    pre.setAttribute("spellcheck", "false");
    pre.setAttribute("contenteditable", "false");
    highlightCode(code);
    if (!pre.querySelector(".copy-code")) {
      const copy = document.createElement("span");
      copy.className = "copy-code flex-child-center";
      copy.setAttribute("title", "复制代码");
      copy.innerHTML = '<span class="iconify" data-icon="fa:clipboard"></span>';
      code.after(copy);
    }
  });
  return root.innerHTML;
}
