/**
 * External dependencies
 */
import { render } from 'enzyme';
import { isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import withSpokenMessages from '../';

describe( 'withSpokenMessages', () => {
	it( 'should generate speak and debouncedSpeak props', () => {
		const testSpeak = jest.fn();
		const testDebouncedSpeak = jest.fn();
		const DumpComponent = withSpokenMessages( ( { speak, debouncedSpeak } ) => {
			testSpeak( isFunction( speak ) );
			testDebouncedSpeak( isFunction( debouncedSpeak ) );
			return <div />;
		} );
		render( <DumpComponent /> );

		// Unrendered element.
		expect( testSpeak ).toBeCalledWith( true );
		expect( testDebouncedSpeak ).toBeCalledWith( true );
	} );
} );
