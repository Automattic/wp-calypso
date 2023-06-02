/**
 * @jest-environment jsdom
 */

import { render, act, waitFor } from '@testing-library/react';
import globalMoment from 'moment';
import { PureComponent } from 'react';
import { createStore } from 'redux';
import { withLocalizedMoment, useLocalizedMoment } from '..';
import MomentProvider from '../provider';

// helper to create state object with specified `languageSlug`
const createState = ( localeSlug ) => ( { ui: { language: { localeSlug } } } );

// reducer for the Redux store
const reducer = ( state, action ) => {
	switch ( action.type ) {
		case 'SET':
			return createState( action.languageSlug );
		default:
			return state;
	}
};

// Pure component that renders a "day-name month-name" label
// We'll be testing if it rerenders the date despite being pure
class Label extends PureComponent {
	render() {
		const { moment, date } = this.props;
		return moment( date ).format( 'dddd MMMM' );
	}
}

const LabelWithMomentHOC = withLocalizedMoment( Label );

// The same Label component, but this time a stateless functional one that uses hooks
const LabelWithMomentHook = ( { date } ) => {
	const moment = useLocalizedMoment();
	return moment( date ).format( 'dddd MMMM' );
};

// expected values of the label in different languages
const enLabel = 'Thursday November';
const csLabel = 'čtvrtek listopad';

// Set a new locale by dispatching an action to the Redux store.
const setLocale = async ( languageSlug, store ) => {
	store.dispatch( { type: 'SET', languageSlug } );
};

// Test with both variants of the Label component: wrapped in HOC and using hooks
describe.each( [
	[ 'withLocalizedMoment', LabelWithMomentHOC ],
	[ 'useLocalizedMoment', LabelWithMomentHook ],
] )( '%s', ( _, LocalizedLabel ) => {
	// reset the locale before and each after test, to avoid cross-test influence
	beforeEach( () => globalMoment.locale( 'en' ) );
	afterEach( () => globalMoment.locale( 'en' ) );

	it( 'renders localized date on a repeated language switch', async () => {
		const store = createStore( reducer, createState( 'en' ) );

		const { container } = render(
			<MomentProvider store={ store }>
				<LocalizedLabel date="2018-11-01" />
			</MomentProvider>
		);

		expect( container.firstChild ).toHaveTextContent( enLabel );

		await act( () => setLocale( 'cs', store ) );
		await waitFor( () => {
			expect( container.firstChild ).toHaveTextContent( csLabel );
		} );

		await act( () => setLocale( 'en', store ) );
		await waitFor( () => {
			expect( container.firstChild ).toHaveTextContent( enLabel );
		} );

		await act( () => setLocale( 'cs', store ) );
		await waitFor( () => {
			expect( container.firstChild ).toHaveTextContent( csLabel );
		} );
	} );

	it( 'starts with flash of EN content and then rerenders when non-EN is initial state', async () => {
		const store = createStore( reducer, createState( 'cs' ) );

		const { container } = render(
			<MomentProvider store={ store }>
				<LocalizedLabel date="2018-11-01" />
			</MomentProvider>
		);

		// initial rendering is EN, but loading CS is in progress...
		expect( container.firstChild ).toHaveTextContent( enLabel );

		// and verify that indeed we are CS now
		await waitFor( () => expect( container.firstChild ).toHaveTextContent( csLabel ) );
	} );

	it( 'renders localized dates when using multiple providers', async () => {
		const store = createStore( reducer, createState( 'en' ) );

		// create two identical providers connected to the same Redux store
		const wrappers = [ 1, 2 ].map( () =>
			render(
				<MomentProvider store={ store }>
					<LocalizedLabel date="2018-11-01" />
				</MomentProvider>
			)
		);

		wrappers.forEach( ( { container } ) =>
			expect( container.firstChild ).toHaveTextContent( enLabel )
		);

		await act( () => setLocale( 'cs', store ) );
		wrappers.forEach( ( { container } ) =>
			expect( container.firstChild ).toHaveTextContent( csLabel )
		);

		await act( () => setLocale( 'en', store, ...wrappers ) );
		wrappers.forEach( ( { container } ) =>
			expect( container.firstChild ).toHaveTextContent( enLabel )
		);
	} );
} );
