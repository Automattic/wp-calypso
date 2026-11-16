import { vi } from 'vitest';

// jsdom has no `matchMedia`. Every query reports no match, as on the narrowest viewport.
if ( typeof window !== 'undefined' ) {
	window.matchMedia = vi.fn( ( query ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	} ) );
}
