/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { DESTINATION_BASED_SALES_TAX } from './constants';

export default () => {
	return {
		code: 'CA',
		name: translate( 'Canada' ),
		defaultState: 'AB',
		states: [
			{
				code: 'AB',
				name: translate( 'Alberta' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'BC',
				name: translate( 'British Columbia' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MB',
				name: translate( 'Manitoba' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NB',
				name: translate( 'New Brunswick' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NL',
				name: translate( 'Newfoundland and Labrador' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NT',
				name: translate( 'Northwest Territories' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NS',
				name: translate( 'Nova Scotia' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NU',
				name: translate( 'Nunavut' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'ON',
				name: translate( 'Ontario' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'PE',
				name: translate( 'Prince Edward Island' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'QC',
				name: translate( 'Quebec' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'SK',
				name: translate( 'Saskatchewan' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'YT',
				name: translate( 'Yukon Territory' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
		],
		statesLabel: translate( 'Province' ),
	};
};
