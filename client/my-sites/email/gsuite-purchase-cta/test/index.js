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

jest.mock( 'components/email-verification/email-verification-gate', () => 'EmailVerificationGate' );
jest.mock( 'my-sites/email/gsuite-purchase-features', () => 'GSuitePurchaseFeatures' );

describe( 'GSuitePurchaseCta', () => {
	test( 'it renders GSuitePurchaseCta with basic plan', () => {
		const store = createReduxStore( {
			ui: { selectedSiteId: 123 },
			sites: {
				items: {
					123: {
						ID: 123,
						URL: 'https://test.com',
					},
				},
			},
		} );
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuitePurchaseCta annualPrice={ '$50' } monthlyPrice={ '$5' } productSlug={ 'gapps' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePurchaseCta with business plan', () => {
		const store = createReduxStore( {
			ui: { selectedSiteId: 123 },
			sites: {
				items: {
					123: {
						ID: 123,
						URL: 'https://test.com',
					},
				},
			},
		} );
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuitePurchaseCta
						annualPrice={ '$50' }
						monthlyPrice={ '$5' }
						productSlug={ 'gapps_unlimited' }
					/>
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
