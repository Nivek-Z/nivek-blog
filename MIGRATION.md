# Migration notes

Local static port of the public site [https://blog.nivekz.org](https://blog.nivekz.org) (Nivek's 日记).

## Posts

- Included: **27** public posts (`spec.visible = PUBLIC` and published). Same set as the live content API (27 items). List order is `spec.publishTime` descending (pinned first), which matches the public homepage and `sort=spec.publishTime,desc`. The unsorted content API follows creation order and places the k3s post later. 10 per page (`/`, `/page/2`, `/page/3`).
- Excluded from the public build: **21** of 48 exported records.
  - **9 drafts** (not published).
  - **3 deleted**.
  - **9 published but PRIVATE** (not on the public API): 自用家庭网络架构, 纪念：提交了第一个issue！, 对app逆向的探索, 网页端对话openwebui lobebot的使用感觉对比, 如何固定docker容器的ip, docker版饥荒开服, 软件开发学习中ing(?不学了), 实用网站推荐(持续更新), 精品文章（持续更新）.

## Theme

- Source of truth: deployed plugin `theme-sakura` **2.4.3** at `/workspace/halo-export/themes/theme-sakura/` (LIlGG/halo-theme-sakura tag v2.4.3). `theme-earth` was ignored.
- Compiled CSS `main-2.4.3.min.css` and Dracula highlight CSS are served from `public/themes/theme-sakura/`. Layout DOM follows the live Sakura templates (header, home hero, imageflow cards, post header, footer, skin switcher).
- Theme color `#FE9600`, fonts Ubuntu / Noto Serif SC / Source Code Pro (Google Fonts), sakura cursor skins, hero `/upload/686f1fae11428.webp`.

## Images

- Raster images used by public posts, covers, the home hero, favicon, photo gallery, and theme skins were converted with `cwebp` 1.5.0 into this project (`public/upload/*.webp` and theme `*.webp`). Originals in `halo-export` were not modified.
- About **123** WebP files under `public/upload/`, plus converted theme rasters (scroll, skins, share icons). SVG/CUR and the search-box `iloli.gif` stay as shipped by the theme.
- One friend-link logo (`99c3c809-….png`) is not in the export and 404s on the live site; that card uses the theme default avatar.
- One truncated JPEG (`1754966329734.jpeg`) was re-saved with Pillow (`LOAD_TRUNCATED_IMAGES`) then passed through `cwebp`.

## Preview

```bash
cd /workspace/nivek-blog
pnpm preview --host 127.0.0.1 --port 4321
```

Dev server: `pnpm dev --host 127.0.0.1 --port 4321`.

## Known visual gaps

Closed in this pass:

- `/archives` is the Sakura month timeline (orange year-month headings). The newest year starts open; older years stay collapsed until the heading is clicked. Posts stay at `/archives/<slug>`. A bare slug (no `/archives` prefix) is not a route and 404s. Month headings use the theme `ph:read-cv-logo-bold` SVG (orange circle via `.archive-time svg`). Each post row has the `ic:round-access-time` clock. Particle lines are not started on `/archives` or `/photos` (live default skin is plain white).
- Article pages put back only the two Sakura `minicode` notices at the top of `.entry-content`: edit time (`last_time`), then read time (`word_count`). Copy is the English `en.json` strings. Color follows the theme type (blue `rgba(167, 210, 226, 1)` when recent / short, peach or pink when older or long). No numbered summary. License and signature stay the English Sakura strings. Share stays six networks. WeChat QR canvas is still not filled.
- `/photos` uses the live toolbar: filter label `All` (group `二刺螈` unchanged), two `#grid-changer` buttons (3 and 5 columns), and CSS-column packing instead of a flex grid. The content column is full width (`--site-content-max-width: none`, padding 0), matching the live photos template. Same 66 images in the same order (WebP).
- Code blocks are highlighted at build time with highlight.js 11 the way `registerHighlight` does (`highlight-wrap`, `data-rel`, Dracula token classes, line-number table when `code_line` is on). Dracula CSS was already loaded.

Still deferred:

- Particle / star canvas is off site-wide, including the home hero. Live still draws particles.js; that overlay was removed on purpose because it was too busy. Hero image, cards, and page content stay.
- Halo comments, live2d / 看板娘, APlayer/music, pjax, NProgress, Halo search modal, Halo console login. Search stays a simple local title/excerpt page. Guestbook body stays empty, matching the live page (comments omitted).
- Switch Theme panel is present but not a parity target. Thumbnail yellow lazy-load placeholders are not reproduced.
- Photo packing is CSS columns, not Isotope's absolute masonry, so a few gaps can still differ from the live gallery. The column switcher only toggles 3 vs 5.
- TOC is static HTML (tocbot classes) with a small scroll-spy that toggles Sakura's orange `.is-active-link` marker. Copy-code is the theme button markup; it does not write to the clipboard.
- Live `/about` is the default Halo placeholder page and is not in the nav. Local nav still points 留言板 at `/1752754799645`. There is no local `/about` page.
- Random cover API is off on the live site (`rimage_cover_open: false`); posts without a cover use `temp.webp`, same as live.
- “登录” does not open Halo console. External monitors (watchdog / umami) stay external links.
- Bing skin still points at the remote `api.1314.cool` image.


## Home parity checkpoint (2026-10-04 11:05 HKT)

Compared the live homepage with the local preview at 1440×900 and 768px (Chrome, fonts and lazy images loaded, particles canvas removed from the live capture only). Theme CSS `main-2.4.3.min.css` is byte-identical. Hero height, header (fixed, nav hidden until hover/scroll), Discovery row, card size (780×300, 10px radius, alternating thumbs), fonts (Noto Serif SC body, Ubuntu on Discovery), and footer credits match. Cover files are the WebP conversions of the same live assets.

Closed this pass: the header account menu label is the English Sakura string `login` (was `登录`), matching `en.json` `user.login` the way the rest of the home chrome is English.

Still visibly different on `/`, and left alone:

- Star / particle canvas. Live still draws it; local stays off on purpose.
- live2d / 看板娘 sits on the lower-left of the live hero (speech bubble included). Deferred.
- A few card hit counts differ (for example the first card is 1 locally and 0 live). Deferred as hit-count drift.
- Search still goes to the local results page instead of the Halo search modal. The magnifier icon matches.
- Copy-code still does not write to the clipboard. WeChat QR canvas is still empty. Photo packing is still CSS columns. Those were dropped for this home pass.


## Chinese UI checkpoint (2026-10-04 11:09 HKT)

The earlier home note that switched the account menu to English `login` is wrong for this site. `zh.json` `user.login` is `登录`, and that label is restored. List and article chrome now follow `theme-sakura` 2.4.3 `zh.json`, not `en.json`. Dates use `Intl` `zh-CN` with `-` separators (`2026-09-19`), the same shape Sakura's `datetimeFormat` produces for `zh-CN`.

Preview `http://127.0.0.1:4321/` (no trailing slash on nested routes) serves the new dist. Checked `/`, `/archives/ge-ren-xiang-zhi-jin-wei-zhi-zhe-teng-nasqing-kuang-hui-zong-tie`, `/photos`, `/archives`.

String changes (before → after):

- `src/components/PostCard.astro`: `Posted on` → `发布于`; `N  hits` → `N 热度`; `N comments` → `N 条评论`.
- `src/components/PostList.astro`: `Discovery` → `发现`; `Next Page` → `下一页`; `No more post(s)` → `没有更多文章了`.
- `src/pages/archives/[slug].astro`: `Posted on` → `发布于`; `Last updated on` → `最后编辑于`; `N Views` → `N 次阅读`; signature `My favorite thing is to leave this blank :)` → `我喜欢做的事就是不写个性签名`; license → `知识共享署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)`; share titles/help → `分享至微博`, `分享至 QQ`, `微信扫一扫：分享`, `微信里点“发现”，扫一下`, `二维码便可将本文分享至朋友圈。`, `分享至豆瓣`, `分享至 QQ 空间`, `分享至领英`. `Previous Post` / `Next Post` stay English (zh.json keeps them).
- `src/lib/postExtras.ts`: edit notice → `文章内容上次编辑时间于 <b>{{sinceLastTime}}</b>。{{remind}}` with reminds `近期有所更新，请放心阅读！` / `文章内容已经较久没有更新了，也许不再适用！` / `文章内容已经很陈旧了，也许不再适用！`. Word notice → `文章共 <b>{{postWordCount}}</b> 字，阅读完预计需要 <b> {{timeString}}</b>。{{remind}}` with reminds `文章篇幅适中，可以放心阅读。` / `文章篇幅较长，建议分段阅读。` / `文章内容已经很陈旧了，也许不再适用！`. Duration units → `N 天` / `N 小时` / `N 分钟` / `N 秒`. Relative time locale `zh-CN`. Copy button title `Copy code` → `复制代码` (still does not write the clipboard).
- `src/pages/photos.astro`: filter `All` → `全部`.
- `src/pages/archives/index.astro`: heading `Post Archive` → `文章归档`.
- `src/layouts/Base.astro`: account menu stays `登录`.

Homepage layout was already aligned at 1440 and 768 (hero, cards, spacing, fonts, top bar). This pass did not add star particles and did not rework archives/article/photo layout.

Still different, left alone:

- Star/particle canvas off on purpose.
- live2d, Halo comments, APlayer/music deferred.
- Hit counts can still disagree with live.
- Search is the local page, not the Halo modal.
- WeChat share canvas is still empty (icon and Chinese caption stay).
- Copy-code button does not copy.
- Photo packing is still CSS columns, not Isotope.


## Layout checkpoint, archives and article (2026-10-04 11:20 HKT)

Compared DOM and computed layout of `/archives` and `/archives/ge-ren-xiang-zhi-jin-wei-zhi-zhe-teng-nasqing-kuang-hui-zong-tie` with the live site at 1440px and 768px (Chrome). Theme CSS is the same `main-2.4.3.min.css`. No Astro or CSS edit this pass: the boxes already match, so nothing was redesigned.

What matched:

- Archives: same month groups, newest year open and older years collapsed (`active` / `max-height: 0`). At 1440 the content column is 800×2341 starting at y=227; at 768 it is 768×2226 with the same 4% side padding. Timeline dots, bricks, and `09-19` style dates line up. Page title uses the theme `{ }` brackets.
- Article: `post-header` / `page-header` is 158px tall with no cover band. Entry is 780px (707px at 768) with the frosted `article-protected-bg` (padding 20px, `rgba(255,255,255,.6)`). TOC sits at x=1140. Footer meta is 780×80 at desktop and hidden at 768, same as the theme. Heading pilcrow, image widths, and author block are present on both.

Checked and left as-is:

- `.site-content.archives` is forced to `#fff` in `public/extra.css`. Live computed background is `rgba(255,255,255,.8)`. On the white page that difference is not visible (pixel diff about 0.2%, and that remainder is the live tab still painting the English `Post Archive` fallback before i18n).
- Live headless Chrome rendered article chrome in English, so the two notice bars are taller there. Local Chinese notices are one line. That is copy, not a layout bug.
- Star canvas, live2d, comments, music, empty WeChat canvas, copy-code clipboard, and photo packing were not touched. `Previous Post` / `Next Post` stay English.
- Hit counts still differ (local `1 次阅读` vs live `11` on this article).

Preview confirmed: http://127.0.0.1:4321/archives and http://127.0.0.1:4321/archives/ge-ren-xiang-zhi-jin-wei-zhi-zhe-teng-nasqing-kuang-hui-zong-tie (no trailing slash).


## Constellation search (2026-10-04 11:30 HKT)

No dots-and-lines overlay is in the pages that ship. Preview HTML for `/` and the nas article loads only `iconify.min.js` and `/site.js`. Rendered pages have **0 canvases** (the article QR canvas is empty and not a background). `body` background-image is `none`. No `::before`/`::after` paints a pattern. `particles.js` / `#particles-js` are not in source or `dist`.

Searched: `src/`, `public/site.js`, `public/extra.css`, theme `main-2.4.3.min.css`, built `dist/**/*.html`, and computed styles in Chrome. Closest unused files, not applied on the default white skin: `public/themes/theme-sakura/assets/images/themes/star02.webp` (star tile) and `kyotoanimation.webp` (colored dots). The hero illustration’s painted sky specks are part of `/upload/686f1fae11428.webp`, not a separate script. That image stays. The line-and-dot effect must stay off; do not add particles or a constellation canvas back.
