/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import globalMoment from 'moment';

/**
 * Internal dependencies
 */
import { MomentProvider } from '../context';
import { withLocalizedMoment, useLocalizedMoment } from '..';

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
class Label extends React.PureComponent {
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

// helper that looks at the `MomentProvider` instance wrapped inside `Connect(MomentProvider)`
// and gets the `loadingLocalePromise` instance property. The provider exposes the property
// for testing purposes so that the test can wait for the locale dynamic import to finish.
// After the promise is resolved, the wrapper is updated in order to get the latest rendered tree.
const getMomentProviderLoadingPromise = async ( wrapper ) => {
	await wrapper.childAt( 0 ).instance().loadingLocalePromise;
	wrapper.update();
};

// Set a new locale by dispatching an action to the Redux store and then wait for locale load
// to finish inside all specified providers.
const setLocaleAndWait = async ( languageSlug, store, ...providerWrappers ) => {
	store.dispatch( { type: 'SET', languageSlug } );
	await Promise.all( providerWrappers.map( getMomentProviderLoadingPromise ) );
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

		const wrapper = mount(
			<MomentProvider store={ store }>
				<LocalizedLabel date="2018-11-01" />
			</MomentProvider>
		);

		expect( wrapper.text() ).toEqual( enLabel );

		await setLocaleAndWait( 'cs', store, wrapper );
		expect( wrapper.text() ).toEqual( csLabel );

		await setLocaleAndWait( 'en', store, wrapper );
		expect( wrapper.text() ).toEqual( enLabel );

		await setLocaleAndWait( 'cs', store, wrapper );
		expect( wrapper.text() ).toEqual( csLabel );
	} );

	it( 'starts with flash of EN content and then rerenders when non-EN is initial state', async () => {
		const store = createStore( reducer, createState( 'cs' ) );

		const wrapper = mount(
			<MomentProvider store={ store }>
				<LocalizedLabel date="2018-11-01" />
			</MomentProvider>
		);

		// initial rendering is EN, but loading CS is in progress...
		expect( wrapper.text() ).toEqual( enLabel );

		// wait for the CS load to finish...
		await getMomentProviderLoadingPromise( wrapper );

		// and verify that indeed we are CS now
		expect( wrapper.text() ).toEqual( csLabel );
	} );

	it( 'renders localized dates when using multiple providers', async () => {
		const store = createStore( reducer, createState( 'en' ) );

		// create two identical providers connected to the same Redux store
		const wrappers = [ 1, 2 ].map( () =>
			mount(
				<MomentProvider store={ store }>
					<LocalizedLabel date="2018-11-01" />
				</MomentProvider>
			)
		);

		wrappers.forEach( ( wrapper ) => expect( wrapper.text() ).toEqual( enLabel ) );

		await setLocaleAndWait( 'cs', store, ...wrappers );
		wrappers.forEach( ( wrapper ) => expect( wrapper.text() ).toEqual( csLabel ) );

		await setLocaleAndWait( 'en', store, ...wrappers );
		wrappers.forEach( ( wrapper ) => expect( wrapper.text() ).toEqual( enLabel ) );
	} );
} );
