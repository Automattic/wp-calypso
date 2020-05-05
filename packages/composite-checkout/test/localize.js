/**
 * External dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { useLocalize, LocalizeProvider } from '../src/lib/localize';

// React writes to console.error when a component throws before re-throwing
// but we don't want to see that here so we mock console.error.
/* eslint-disable no-console */
const original = console.error;

describe( 'useLocalize', function () {
	beforeEach( () => {
		console.error = jest.fn();
	} );

	afterEach( () => {
		console.error = original;
	} );

	it( 'throws if outside of a CheckoutProvider', function () {
		const ThingWithLocalize = () => {
			const localize = useLocalize();
			return <span>{ localize( 'hello' ) }</span>;
		};
		expect( () => render( <ThingWithLocalize /> ) ).toThrow( /CheckoutProvider/ );
	} );

	it( 'returns a function that returns a string', function () {
		const ThingWithLocalize = () => {
			const localize = useLocalize();
			return <span data-testid="text">{ localize( 'hello' ) }</span>;
		};
		const { getByTestId } = render(
			<LocalizeProvider locale={ 'US' }>
				<ThingWithLocalize />
			</LocalizeProvider>
		);
		expect( getByTestId( 'text' ) ).toHaveTextContent( 'hello' );
	} );
} );
/* eslint-enable no-console */
