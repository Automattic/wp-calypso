/** @format */
/**
 * External dependencies
 */
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import GSuitePurchaseCta from '../';

// components to mock
jest.mock( 'components/email-verification/email-verification-gate', () => 'EmailVerificationGate' );
jest.mock( 'my-sites/email/gsuite-purchase-features', () => 'GSuitePurchaseFeatures' );
jest.mock( 'my-sites/email/gsuite-purchase-cta/sku-info', () => 'GSuitePurchaseCtaSkuInfo' );

describe( 'GSuitePurchaseCta', () => {
	const testStore = createReduxStore( {
		currentUser: {
			currencyCode: 'USD',
		},
		productsList: {
			items: {
				gapps: {
					cost: 72,
				},
				gapps_unlimited: {
					cost: 144,
				},
			},
		},
		sites: {
			items: {
				123: {
					ID: 123,
					URL: 'https://test.com',
				},
			},
		},
		ui: { selectedSiteId: 123 },
	} );

	test( 'it renders GSuitePurchaseCta', () => {
		const tree = renderer
			.create(
				<Provider store={ testStore }>
					<GSuitePurchaseCta domainName={ 'test.com' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
