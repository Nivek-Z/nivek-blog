import data from "../data/site.json";
import modifyTimes from "../data/modify-times.json";

export const SITE_TITLE = "Nivek's 日记";
export const SITE_SUBTITLE = "欢迎来到Nivek的赛博小屋";
export const PAGE_SIZE = 10;
export const TEMP_COVER = "/themes/theme-sakura/assets/images/default/temp.webp";
export const DEFAULT_AVATAR = "/themes/theme-sakura/assets/images/default/avatar.webp";

export interface TocNode {
  level: number;
  id: string;
  text: string;
  children: TocNode[];
}

export interface Tag {
  name: string;
  slug: string;
  permalink: string;
}

export interface Post {
  title: string;
  slug: string;
  permalink: string;
  publishTime: string | null;
  publishLabel: string;
  editLabel: string;
  excerpt: string;
  cover: string;
  pinned: boolean;
  visit: number;
  comment: number;
  tags: Tag[];
  categories: Tag[];
  owner: string;
  avatar: string;
  html: string;
  toc: TocNode[];
  halo_id: string;
  lastModifyTime: string | null;
}

const modifyMap = modifyTimes as Record<string, string | null>;

function timeValue(iso: string | null | undefined) {
  if (!iso) return 0;
  const value = Date.parse(iso);
  return Number.isNaN(value) ? 0 : value;
}

/** English date used by Sakura when `date_format` is `date` and the UI locale is `en`. */
export function formatSiteDate(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

export const posts: Post[] = (data.posts as Omit<Post, "lastModifyTime">[])
  .map((post) => ({
    ...post,
    lastModifyTime: modifyMap[post.slug] || null,
  }))
  .sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return timeValue(b.publishTime) - timeValue(a.publishTime);
  });
export const links = data.links as { href: string; logo: string; name: string; description: string }[];
export const photos = data.photos as {
  className: string;
  alt: string;
  src: string;
  title: string;
  description: string;
}[];
export const bgThemes = data.bgThemes as {
  bg_name: string;
  bg_url?: string;
  bg_img_strategy: string;
  bg_icon: string;
  bg_night: boolean;
  bg_isdefault: boolean;
}[];
export const assets = {
  hero: data.hero as string,
  favicon: data.favicon as string,
  avatar: data.avatar as string,
  scroll: data.scroll as string,
  weibo: data.weibo as string,
  qq: data.qq as string,
  play: data.play as string,
  pause: data.pause as string,
};

export function coverOf(post: Post) {
  return post.cover || TEMP_COVER;
}

export function pageCount(total = posts.length) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function slicePage(list: Post[], page: number) {
  const start = (page - 1) * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE);
}

export function tagGroups() {
  const map = new Map<string, { name: string; slug: string; permalink: string; posts: Post[] }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!map.has(tag.slug)) map.set(tag.slug, { ...tag, posts: [] });
      map.get(tag.slug)!.posts.push(post);
    }
  }
  return [...map.values()];
}
