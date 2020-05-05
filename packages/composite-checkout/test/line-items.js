/**
 * External dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { LineItemsProvider, useLineItems } from '../src/lib/line-items';

// React writes to console.error when a component throws before re-throwing
// but we don't want to see that here so we mock console.error.
/* eslint-disable no-console */
const original = console.error;

describe( 'useLineItems', function () {
	beforeEach( () => {
		console.error = jest.fn();
	} );

	afterEach( () => {
		console.error = original;
	} );

	it( 'throws if outside of a CheckoutProvider', function () {
		const ThingWithHook = () => {
			const [ items, total ] = useLineItems();
			return (
				<div>
					{ items.map( ( item ) => (
						<span key={ item.id }>{ item.label }</span>
					) ) }
					<span key={ total.id }>{ total.label }</span>
				</div>
			);
		};
		expect( () => render( <ThingWithHook /> ) ).toThrow( /CheckoutProvider/ );
	} );

	it( 'does not throw if there are no items', function () {
		const ThingWithHook = () => {
			const [ items, total ] = useLineItems();
			return (
				<div>
					{ items.map( ( item ) => (
						<span data-testid={ item.id } key={ item.id }>
							{ item.label }
						</span>
					) ) }
					<span data-testid="total" key={ total.id }>
						{ total.label }
					</span>
				</div>
			);
		};
		const renderThing = () =>
			render(
				<LineItemsProvider
					total={ {
						id: 'total',
						label: 'total',
						amount: { value: 40, currency: 'USD', displayValue: '40' },
					} }
					items={ [] }
				>
					<ThingWithHook />
				</LineItemsProvider>
			);
		expect( renderThing ).not.toThrow( /CheckoutProvider/ );
	} );

	it( 'returns the items list', function () {
		const ThingWithHook = () => {
			const [ items, total ] = useLineItems();
			return (
				<div>
					{ items.map( ( item ) => (
						<span data-testid={ item.id } key={ item.id }>
							{ item.label }
						</span>
					) ) }
					<span data-testid="total" key={ total.id }>
						{ total.label }
					</span>
				</div>
			);
		};
		const { getByTestId } = render(
			<LineItemsProvider
				total={ {
					id: 'total',
					label: 'total',
					amount: { value: 40, currency: 'USD', displayValue: '40' },
				} }
				items={ [
					{
						id: 'one',
						label: 'thing1',
						amount: { value: 20, currency: 'USD', displayValue: '20' },
					},
					{
						id: 'two',
						label: 'thing2',
						amount: { value: 20, currency: 'USD', displayValue: '20' },
					},
				] }
			>
				<ThingWithHook />
			</LineItemsProvider>
		);
		expect( getByTestId( 'one' ) ).toHaveTextContent( 'thing1' );
		expect( getByTestId( 'two' ) ).toHaveTextContent( 'thing2' );
	} );

	it( 'returns the total', function () {
		const ThingWithHook = () => {
			const [ items, total ] = useLineItems();
			return (
				<div>
					{ items.map( ( item ) => (
						<span data-testid={ item.id } key={ item.id }>
							{ item.label }
						</span>
					) ) }
					<span data-testid="total" key={ total.id }>
						{ total.label }
					</span>
				</div>
			);
		};
		const { getByTestId } = render(
			<LineItemsProvider
				total={ {
					id: 'total',
					label: 'total',
					amount: { value: 40, currency: 'USD', displayValue: '40' },
				} }
				items={ [
					{
						id: 'one',
						label: 'thing1',
						amount: { value: 20, currency: 'USD', displayValue: '20' },
					},
					{
						id: 'two',
						label: 'thing2',
						amount: { value: 20, currency: 'USD', displayValue: '20' },
					},
				] }
			>
				<ThingWithHook />
			</LineItemsProvider>
		);
		expect( getByTestId( 'total' ) ).toHaveTextContent( 'total' );
	} );
} );
/* eslint-enable no-console */
