/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export default () => {
	return (
		{
			code: 'US',
			name: translate( 'United States of America' ),
			states: [
				{
					code: 'AL',
					name: translate( 'Alabama' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'AK',
					name: translate( 'Alaska' ),
					salesTaxBasis: 'none',
				},
				{
					code: 'AZ',
					name: translate( 'Arizona' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'AR',
					name: translate( 'Arkansas' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'CA',
					name: translate( 'California' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'CO',
					name: translate( 'Colorado' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'CT',
					name: translate( 'Connecticut' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'DE',
					name: translate( 'Delaware' ),
					salesTaxBasis: 'none',
				},
				{
					code: 'DC',
					name: translate( 'District Of Columbia' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'FL',
					name: translate( 'Florida' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'GA',
					name: translate( 'Georgia' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'HI',
					name: translate( 'Hawaii' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'ID',
					name: translate( 'Idaho' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'IL',
					name: translate( 'Illinois' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'IN',
					name: translate( 'Indiana' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'IA',
					name: translate( 'Iowa' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'KS',
					name: translate( 'Kansas' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'KY',
					name: translate( 'Kentucky' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'LA',
					name: translate( 'Louisiana' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'ME',
					name: translate( 'Maine' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'MD',
					name: translate( 'Maryland' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'MA',
					name: translate( 'Massachusetts' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'MI',
					name: translate( 'Michigan' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'MN',
					name: translate( 'Minnesota' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'MS',
					name: translate( 'Mississippi' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'MO',
					name: translate( 'Missouri' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'MT',
					name: translate( 'Montana' ),
					salesTaxBasis: 'none',
				},
				{
					code: 'NE',
					name: translate( 'Nebraska' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'NV',
					name: translate( 'Nevada' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'NH',
					name: translate( 'New Hampshire' ),
					salesTaxBasis: 'none',
				},
				{
					code: 'NJ',
					name: translate( 'New Jersey' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'NM',
					name: translate( 'New Mexico' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'NY',
					name: translate( 'New York' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'NC',
					name: translate( 'North Carolina' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'ND',
					name: translate( 'North Dakota' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'OH',
					name: translate( 'Ohio' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'OK',
					name: translate( 'Oklahoma' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'OR',
					name: translate( 'Oregon' ),
					salesTaxBasis: 'none',
				},
				{
					code: 'PA',
					name: translate( 'Pennsylvania' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'RI',
					name: translate( 'Rhode Island' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'SC',
					name: translate( 'South Carolina' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'SD',
					name: translate( 'South Dakota' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'TN',
					name: translate( 'Tennessee' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'TX',
					name: translate( 'Texas' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'UT',
					name: translate( 'Utah' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'VT',
					name: translate( 'Vermont' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'VA',
					name: translate( 'Virginia' ),
					salesTaxBasis: 'origin',
				},
				{
					code: 'WA',
					name: translate( 'Washington' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'WV',
					name: translate( 'West Virginia' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'WI',
					name: translate( 'Wisconsin' ),
					salesTaxBasis: 'destination',
				},
				{
					code: 'WY',
					name: translate( 'Wyoming' ),
					salesTaxBasis: 'destination',
				},
			],
			statesLabel: translate( 'State' ),
		}
	);
};
