import '@testing-library/jest-dom/vitest';
import ResizeObserver from 'resize-observer-polyfill';
import { vi } from 'vitest';

globalThis.crypto.randomUUID = () => 'fake-uuid';

globalThis.ResizeObserver = ResizeObserver;

// JSDOM implements `CSS.escape` but not `CSS.supports`, which Ariakit calls for
// feature detection. Report everything as unsupported so it takes its fallbacks.
globalThis.CSS = { ...globalThis.CSS, supports: () => false };

// React Testing Library's `waitFor` only advances fake timers when it finds a global `jest`.
globalThis.jest = { advanceTimersByTime: ( ms ) => vi.advanceTimersByTime( ms ) };
