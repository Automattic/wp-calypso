/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SelectOptGroups from 'components/forms/select-opt-groups';

const USStateSelector = ( props ) => {
	const { translate } = props;
	const states = [
		{ value: 'AL', label: translate( 'Alabama' ) },
		{ value: 'AK', label: translate( 'Alaska' ) },
		{ value: 'AZ', label: translate( 'Arizona' ) },
		{ value: 'AR', label: translate( 'Arkansas' ) },
		{ value: 'CA', label: translate( 'California' ) },
		{ value: 'CO', label: translate( 'Colorado' ) },
		{ value: 'CT', label: translate( 'Connecticut' ) },
		{ value: 'DE', label: translate( 'Delaware' ) },
		{ value: 'DC', label: translate( 'District of Columbia' ) },
		{ value: 'FL', label: translate( 'Florida' ) },
		{ value: 'GA', label: translate( 'Georgia' ) },
		{ value: 'HI', label: translate( 'Hawaii' ) },
		{ value: 'ID', label: translate( 'Idaho' ) },
		{ value: 'IL', label: translate( 'Illinois' ) },
		{ value: 'IN', label: translate( 'Indiana' ) },
		{ value: 'IA', label: translate( 'Iowa' ) },
		{ value: 'KS', label: translate( 'Kansas' ) },
		{ value: 'KY', label: translate( 'Kentucky' ) },
		{ value: 'LA', label: translate( 'Louisiana' ) },
		{ value: 'ME', label: translate( 'Maine' ) },
		{ value: 'MD', label: translate( 'Maryland' ) },
		{ value: 'MA', label: translate( 'Massachusetts' ) },
		{ value: 'MI', label: translate( 'Michigan' ) },
		{ value: 'MN', label: translate( 'Minnesota' ) },
		{ value: 'MS', label: translate( 'Mississippi' ) },
		{ value: 'MO', label: translate( 'Missouri' ) },
		{ value: 'MT', label: translate( 'Montana' ) },
		{ value: 'NE', label: translate( 'Nebraska' ) },
		{ value: 'NV', label: translate( 'Nevada' ) },
		{ value: 'NH', label: translate( 'New Hampshire' ) },
		{ value: 'NJ', label: translate( 'New Jersey' ) },
		{ value: 'NM', label: translate( 'New Mexico' ) },
		{ value: 'NY', label: translate( 'New York' ) },
		{ value: 'NC', label: translate( 'North Carolina' ) },
		{ value: 'ND', label: translate( 'North Dakota' ) },
		{ value: 'OH', label: translate( 'Ohio' ) },
		{ value: 'OK', label: translate( 'Oklahoma' ) },
		{ value: 'OR', label: translate( 'Oregon' ) },
		{ value: 'PA', label: translate( 'Pennsylvania' ) },
		{ value: 'RI', label: translate( 'Rhode Island' ) },
		{ value: 'SC', label: translate( 'South Carolina' ) },
		{ value: 'SD', label: translate( 'South Dakota' ) },
		{ value: 'TN', label: translate( 'Tennessee' ) },
		{ value: 'TX', label: translate( 'Texas' ) },
		{ value: 'UT', label: translate( 'Utah' ) },
		{ value: 'VT', label: translate( 'Vermont' ) },
		{ value: 'VA', label: translate( 'Virginia' ) },
		{ value: 'WA', label: translate( 'Washington' ) },
		{ value: 'WV', label: translate( 'West Virginia' ) },
		{ value: 'WI', label: translate( 'Wisconsin' ) },
		{ value: 'WY', label: translate( 'Wyoming' ) },
	];

	const territories = [
		{ value: 'AA', label: translate( 'Armed Forces Americas' ) },
		{ value: 'AE', label: translate( 'Armed Forces Europe, Middle East, & Canada' ) },
		{ value: 'AP', label: translate( 'Armed Forces Pacific' ) },
		{ value: 'AS', label: translate( 'American Samoa' ) },
		{ value: 'FM', label: translate( 'Federated States of Micronesia' ) },
		{ value: 'GU', label: translate( 'Guam' ) },
		{ value: 'MH', label: translate( 'Marshall Islands' ) },
		{ value: 'MP', label: translate( 'Northern Mariana Islands' ) },
		{ value: 'PW', label: translate( 'Palau' ) },
		{ value: 'PR', label: translate( 'Puerto Rico' ) },
		{ value: 'VI', label: translate( 'Virgin Islands' ) },
	];

	const stateGroup = [
		{ label: translate( 'States' ), options: states },
		{ label: translate( 'Territories' ), options: territories },
	];

	return <SelectOptGroups optGroups={ stateGroup } { ...props } />;
};

export default localize( USStateSelector );
