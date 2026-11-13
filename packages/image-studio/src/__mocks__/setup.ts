import '@testing-library/jest-dom/vitest';
import ResizeObserver from 'resize-observer-polyfill';
import { vi } from 'vitest';

globalThis.ResizeObserver = ResizeObserver;

// React Testing Library's `waitFor` only advances fake timers when it finds a global `jest`.
( globalThis as unknown as Record< string, unknown > ).jest = {
	advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ),
};

// jsdom implements `CSS.escape` but not `CSS.supports`, which Ariakit calls for feature detection.
globalThis.CSS = { ...globalThis.CSS, supports: () => false };

globalThis.matchMedia = vi.fn( ( query: string ) => ( {
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
} ) );
