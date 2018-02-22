/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

export default () => {
	return {
		code: 'CA',
		name: translate( 'Canada' ),
		defaultState: 'AB',
		currency: 'CAD',
		dimensionUnit: 'cm',
		weightUnit: 'kg',
		states: [
			{
				code: 'AB',
				name: translate( 'Alberta' ),
			},
			{
				code: 'BC',
				name: translate( 'British Columbia' ),
			},
			{
				code: 'MB',
				name: translate( 'Manitoba' ),
			},
			{
				code: 'NB',
				name: translate( 'New Brunswick' ),
			},
			{
				code: 'NL',
				name: translate( 'Newfoundland and Labrador' ),
			},
			{
				code: 'NT',
				name: translate( 'Northwest Territories' ),
			},
			{
				code: 'NS',
				name: translate( 'Nova Scotia' ),
			},
			{
				code: 'NU',
				name: translate( 'Nunavut' ),
			},
			{
				code: 'ON',
				name: translate( 'Ontario' ),
			},
			{
				code: 'PE',
				name: translate( 'Prince Edward Island' ),
			},
			{
				code: 'QC',
				name: translate( 'Quebec' ),
			},
			{
				code: 'SK',
				name: translate( 'Saskatchewan' ),
			},
			{
				code: 'YT',
				name: translate( 'Yukon Territory' ),
			},
		],
		statesLabel: translate( 'Province' ),
	};
};
