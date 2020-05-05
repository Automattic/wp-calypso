/**
 * External dependencies
 */

import '@testing-library/jest-dom/extend-expect';

// hack until we can upgrade to react@16.9.0
// see https://github.com/testing-library/react-testing-library/issues/459.
const originalError = global.console.error;
beforeAll( () => {
	global.console.error = jest.fn( ( ...args ) => {
		if (
			typeof args[ 0 ] === 'string' &&
			args[ 0 ].includes( 'Please upgrade to at least react-dom@16.9.0' )
		) {
			return;
		}
		return originalError.call( console, args );
	} );
} );

afterAll( () => {
	global.console.error.mockRestore();
} );
