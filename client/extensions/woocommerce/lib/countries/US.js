/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { DESTINATION_BASED_SALES_TAX, NO_SALES_TAX, ORIGIN_BASED_SALES_TAX } from './constants';

export default () => {
	return {
		code: 'US',
		name: translate( 'USA' ),
		defaultState: 'AL',
		states: [
			{
				code: 'AL',
				name: translate( 'Alabama' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'AK',
				name: translate( 'Alaska' ),
				salesTaxBasis: NO_SALES_TAX,
			},
			{
				code: 'AZ',
				name: translate( 'Arizona' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'AR',
				name: translate( 'Arkansas' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'CA',
				name: translate( 'California' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'CO',
				name: translate( 'Colorado' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'CT',
				name: translate( 'Connecticut' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'DE',
				name: translate( 'Delaware' ),
				salesTaxBasis: NO_SALES_TAX,
			},
			{
				code: 'DC',
				name: translate( 'District Of Columbia' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'FL',
				name: translate( 'Florida' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'GA',
				name: translate( 'Georgia' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'HI',
				name: translate( 'Hawaii' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'ID',
				name: translate( 'Idaho' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'IL',
				name: translate( 'Illinois' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'IN',
				name: translate( 'Indiana' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'IA',
				name: translate( 'Iowa' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'KS',
				name: translate( 'Kansas' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'KY',
				name: translate( 'Kentucky' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'LA',
				name: translate( 'Louisiana' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'ME',
				name: translate( 'Maine' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MD',
				name: translate( 'Maryland' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MA',
				name: translate( 'Massachusetts' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MI',
				name: translate( 'Michigan' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MN',
				name: translate( 'Minnesota' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MS',
				name: translate( 'Mississippi' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'MO',
				name: translate( 'Missouri' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'MT',
				name: translate( 'Montana' ),
				salesTaxBasis: NO_SALES_TAX,
			},
			{
				code: 'NE',
				name: translate( 'Nebraska' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NV',
				name: translate( 'Nevada' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NH',
				name: translate( 'New Hampshire' ),
				salesTaxBasis: NO_SALES_TAX,
			},
			{
				code: 'NJ',
				name: translate( 'New Jersey' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NM',
				name: translate( 'New Mexico' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'NY',
				name: translate( 'New York' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'NC',
				name: translate( 'North Carolina' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'ND',
				name: translate( 'North Dakota' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'OH',
				name: translate( 'Ohio' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'OK',
				name: translate( 'Oklahoma' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'OR',
				name: translate( 'Oregon' ),
				salesTaxBasis: NO_SALES_TAX,
			},
			{
				code: 'PA',
				name: translate( 'Pennsylvania' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'RI',
				name: translate( 'Rhode Island' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'SC',
				name: translate( 'South Carolina' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'SD',
				name: translate( 'South Dakota' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'TN',
				name: translate( 'Tennessee' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'TX',
				name: translate( 'Texas' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'UT',
				name: translate( 'Utah' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'VT',
				name: translate( 'Vermont' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'VA',
				name: translate( 'Virginia' ),
				salesTaxBasis: ORIGIN_BASED_SALES_TAX,
			},
			{
				code: 'WA',
				name: translate( 'Washington' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'WV',
				name: translate( 'West Virginia' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'WI',
				name: translate( 'Wisconsin' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
			{
				code: 'WY',
				name: translate( 'Wyoming' ),
				salesTaxBasis: DESTINATION_BASED_SALES_TAX,
			},
		],
		statesLabel: translate( 'State' ),
	};
};
