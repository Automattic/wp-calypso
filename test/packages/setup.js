import '@testing-library/jest-dom';

global.crypto.randomUUID = () => 'fake-uuid';

global.ResizeObserver = require( 'resize-observer-polyfill' );

global.matchMedia = jest.fn( ( query ) => ( {
	matches: false,
	media: query,
	onchange: null,
	addListener: jest.fn(), // deprecated
	removeListener: jest.fn(), // deprecated
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
	dispatchEvent: jest.fn(),
} ) );
