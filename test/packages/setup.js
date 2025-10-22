import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.crypto.randomUUID = () => 'fake-uuid';

// Polyfill for TextEncoder/TextDecoder required by superagent 10.x and its dependencies
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
