/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuitePurchaseCtaSkuInfo from '../sku-info';

jest.mock( 'calypso/components/forms/form-button', () => 'Button' );
jest.mock( 'calypso/components/info-popover', () => 'InfoPopover' );

describe( 'GSuitePurchaseCta', () => {
	test( 'it renders GSuitePurchaseCtaSkuInfo with all props', () => {
		const tree = renderer
			.create(
				<GSuitePurchaseCtaSkuInfo
					skuName={ 'G Suite Business' }
					storageText={ 'Unlimited Storage' }
					storageNoticeText={ 'Accounts with fewer than 5 users have 1 TB per user' }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePurchaseCtaSkuInfo with all required props', () => {
		const tree = renderer
			.create(
				<GSuitePurchaseCtaSkuInfo
					skuName={ 'G Suite Business' }
					storageText={ 'Unlimited Storage' }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
