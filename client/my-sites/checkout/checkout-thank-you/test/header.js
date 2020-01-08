/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { CheckoutThankYouHeader } from '../header';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.unmock( 'lib/plans' );
const plans = require( 'lib/plans' );
plans.getFeatureByKey = () => null;
plans.shouldFetchSitePlans = () => false;

jest.unmock( 'lib/products-values' );
const productValues = require( 'lib/products-values' );
productValues.isDotComPlan = jest.fn( () => false );

jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: () => null,
	},
} ) );
jest.mock( '../domain-registration-details', () => 'component--domain-registration-details' );
jest.mock( '../google-apps-details', () => 'component--google-apps-details' );
jest.mock( '../jetpack-plan-details', () => 'component--jetpack-plan-details' );
jest.mock( '../rebrand-cities-thank-you', () => 'component--RebrandCitiesThankYou' );
jest.mock( '../atomic-store-thank-you-card', () => 'component--AtomicStoreThankYouCard' );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'components/happiness-support', () => 'HappinessSupport' );
jest.mock( 'lib/rebrand-cities', () => ( {
	isRebrandCitiesSiteUrl: jest.fn( () => false ),
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

const translate = x => x;

describe( 'CheckoutThankYouHeader', () => {
	const defaultProps = {
		translate,
		primaryPurchase: {
			product_slug: 'business-bundle',
		},
	};
	describe( 'Basic tests', () => {
		test( "Should display a loading indicator while data isn't loaded yet", () => {
			const comp = shallow( <CheckoutThankYouHeader isDataLoaded={ false } { ...defaultProps } /> );
			expect( comp.find( '.checkout-thank-you__header-heading' ).text() ).toBe( 'Loading…' );
		} );
		test( 'Should display getText()-based success message when isSimplified=false (default)', () => {
			const comp = shallow( <CheckoutThankYouHeader isDataLoaded={ true } { ...defaultProps } /> );
			expect( comp.find( '.checkout-thank-you__header-heading' ).text() ).toEqual(
				'Congratulations on your purchase!'
			);
			expect( comp.find( '.checkout-thank-you__header-text' ).text() ).toEqual(
				"Your site is now on the {{strong}}%(productName)s{{/strong}} plan. It's doing somersaults in excitement!"
			);
		} );
		test( 'Should display an alternative success message when isSimplified=true', () => {
			const comp = shallow(
				<CheckoutThankYouHeader isDataLoaded={ true } isSimplified={ true } { ...defaultProps } />
			);
			expect( comp.find( '.checkout-thank-you__header-heading' ).text() ).toEqual(
				'Congratulations on your purchase!'
			);
			expect( comp.find( '.checkout-thank-you__header-text' ).text() ).toEqual(
				'Your site is now on the {{strong}}%(productName)s{{/strong}} plan. Enjoy your powerful new features!'
			);
		} );
	} );
} );
