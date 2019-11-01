/**
 * External dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { useLocalize } from '../../src/lib/localize';

describe( 'useLocalize', function() {
	// React writes to console.error when a component throws before re-throwing
	// but we don't want to see that here so we mock console.error.
	/* eslint-disable no-console */
	const original = console.error;

	beforeEach( () => {
		console.error = jest.fn();
	} );

	afterEach( () => {
		console.error = original;
	} );
	/* eslint-enable no-console */

	it( 'throws if outside of a CheckoutProvider', function() {
		const ThingWithLocalize = () => {
			const localize = useLocalize();
			return <span>{ localize( 'hello' ) }</span>;
		};
		expect( () => render( <ThingWithLocalize /> ) ).toThrow( /CheckoutProvider/ );
	} );
} );
