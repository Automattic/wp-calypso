/**
 * The path `editor-navigate` accepts for a single page: `/page/123`, with
 * either slash optional.
 *
 * Leading zeros and oversized ids are rejected rather than normalized: the
 * ability converts the capture with `Number` while the canvas guard binds the
 * raw text, so `00123` would navigate to one page and bind another.
 *
 * Its own module so the canvas guard, which runs in the shared chat path, can
 * share the shape without pulling in the ability's editor imports.
 */
export const PAGE_PATH = /^\/?page\/([1-9]\d{0,14})\/?$/;
