import '@testing-library/jest-dom/vitest';
import ResizeObserver from 'resize-observer-polyfill';

globalThis.crypto.randomUUID = () => 'fake-uuid';

globalThis.ResizeObserver = ResizeObserver;

// JSDOM implements `CSS.escape` but not `CSS.supports`, which Ariakit calls for
// feature detection. Report everything as unsupported so it takes its fallbacks.
globalThis.CSS = { ...globalThis.CSS, supports: () => false };
