/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */

import { GSuitePurchaseCta } from '../';

// components to mock
jest.mock( 'components/email-verification/email-verification-gate', () => 'EmailVerificationGate' );
jest.mock( 'my-sites/email/gsuite-purchase-cta/sku-info', () => 'GSuitePurchaseCtaSkuInfo' );
jest.mock( 'my-sites/email/gsuite-purchase-features', () => 'GSuitePurchaseFeatures' );
jest.mock( 'components/data/query-products-list', () => 'QueryProductsList' );

describe( 'GSuitePurchaseCta', () => {
	test( 'it renders GSuitePurchaseCta', () => {
		const tree = renderer
			.create(
				<GSuitePurchaseCta
					currencyCode={ 'USD' }
					domainName={ 'test.com' }
					gsuiteBasicCost={ 72 }
					recordTracksEvent={ noop }
					selectedSiteSlug={ 'test.wordpress.com' }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
