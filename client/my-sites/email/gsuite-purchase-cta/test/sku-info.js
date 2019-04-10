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
import GSuitePurchaseCtaSkuInfo from '../sku-info';

jest.mock( 'components/forms/form-button', () => 'Button' );
jest.mock( 'components/info-popover', () => 'InfoPopover' );

describe( 'GSuitePurchaseCta', () => {
	test( 'it renders GSuitePurchaseCtaSkuInfo with all required props', () => {
		const tree = renderer
			.create(
				<GSuitePurchaseCtaSkuInfo
					annualPrice={ '$72' }
					buttonText={ 'Add G Suite' }
					onButtonClick={ noop }
					showButton={ true }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePurchaseCtaSkuInfo with all props', () => {
		const tree = renderer
			.create(
				<GSuitePurchaseCtaSkuInfo
					annualPrice={ '$144' }
					buttonText={ 'Add G Suite Business' }
					onButtonClick={ noop }
					skuName={ 'G Suite Business' }
					storageText={ 'Unlimited Storage' }
					storageNoticeText={ 'Accounts with fewer than 5 users have 1 TB per user' }
					showButton={ true }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
