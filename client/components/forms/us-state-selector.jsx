/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:forms:state-selector' );

/**
 * Internal dependencies
 */
import { SelectOptGroups } from 'components/forms/select-opt-groups';

var USStateSelector = React.createClass( {

	displayName: 'USStateSelector',

	componentWillMount: function() {
		debug( 'Mounting USStateSelector React component.' );
	},

	render: function() {
		var states, territories, stateGroup;

		states = [
			{ value: 'AL', label: this.translate( 'Alabama' ) },
			{ value: 'AK', label: this.translate( 'Alaska' ) },
			{ value: 'AZ', label: this.translate( 'Arizona' ) },
			{ value: 'AR', label: this.translate( 'Arkansas' ) },
			{ value: 'CA', label: this.translate( 'California' ) },
			{ value: 'CO', label: this.translate( 'Colorado' ) },
			{ value: 'CT', label: this.translate( 'Connecticut' ) },
			{ value: 'DE', label: this.translate( 'Delaware' ) },
			{ value: 'DC', label: this.translate( 'District of Columbia' ) },
			{ value: 'FL', label: this.translate( 'Florida' ) },
			{ value: 'GA', label: this.translate( 'Georgia' ) },
			{ value: 'HI', label: this.translate( 'Hawaii' ) },
			{ value: 'ID', label: this.translate( 'Idaho' ) },
			{ value: 'IL', label: this.translate( 'Illinois' ) },
			{ value: 'IN', label: this.translate( 'Indiana' ) },
			{ value: 'IA', label: this.translate( 'Iowa' ) },
			{ value: 'KS', label: this.translate( 'Kansas' ) },
			{ value: 'KY', label: this.translate( 'Kentucky' ) },
			{ value: 'LA', label: this.translate( 'Louisiana' ) },
			{ value: 'ME', label: this.translate( 'Maine' ) },
			{ value: 'MD', label: this.translate( 'Maryland' ) },
			{ value: 'MA', label: this.translate( 'Massachusetts' ) },
			{ value: 'MI', label: this.translate( 'Michigan' ) },
			{ value: 'MN', label: this.translate( 'Minnesota' ) },
			{ value: 'MS', label: this.translate( 'Mississippi' ) },
			{ value: 'MO', label: this.translate( 'Missouri' ) },
			{ value: 'MT', label: this.translate( 'Montana' ) },
			{ value: 'NE', label: this.translate( 'Nebraska' ) },
			{ value: 'NV', label: this.translate( 'Nevada' ) },
			{ value: 'NH', label: this.translate( 'New Hampshire' ) },
			{ value: 'NJ', label: this.translate( 'New Jersey' ) },
			{ value: 'NM', label: this.translate( 'New Mexico' ) },
			{ value: 'NY', label: this.translate( 'New York' ) },
			{ value: 'NC', label: this.translate( 'North Carolina' ) },
			{ value: 'ND', label: this.translate( 'North Dakota' ) },
			{ value: 'OH', label: this.translate( 'Ohio' ) },
			{ value: 'OK', label: this.translate( 'Oklahoma' ) },
			{ value: 'OR', label: this.translate( 'Oregon' ) },
			{ value: 'PA', label: this.translate( 'Pennsylvania' ) },
			{ value: 'RI', label: this.translate( 'Rhode Island' ) },
			{ value: 'SC', label: this.translate( 'South Carolina' ) },
			{ value: 'SD', label: this.translate( 'South Dakota' ) },
			{ value: 'TN', label: this.translate( 'Tennessee' ) },
			{ value: 'TX', label: this.translate( 'Texas' ) },
			{ value: 'UT', label: this.translate( 'Utah' ) },
			{ value: 'VT', label: this.translate( 'Vermont' ) },
			{ value: 'VA', label: this.translate( 'Virginia' ) },
			{ value: 'WA', label: this.translate( 'Washington' ) },
			{ value: 'WV', label: this.translate( 'West Virginia' ) },
			{ value: 'WI', label: this.translate( 'Wisconsin' ) },
			{ value: 'WY', label: this.translate( 'Wyoming' ) }
		];

		territories = [
			{ value: 'AA', label: this.translate( 'Armed Forces Americas' ) },
			{ value: 'AE', label: this.translate( 'Armed Forces Europe, Middle East, & Canada' ) },
			{ value: 'AP', label: this.translate( 'Armed Forces Pacific' ) },
			{ value: 'AS', label: this.translate( 'American Samoa' ) },
			{ value: 'FM', label: this.translate( 'Federated States of Micronesia' ) },
			{ value: 'GU', label: this.translate( 'Guam' ) },
			{ value: 'MH', label: this.translate( 'Marshall Islands' ) },
			{ value: 'MP', label: this.translate( 'Northern Mariana Islands' ) },
			{ value: 'PW', label: this.translate( 'Palau' ) },
			{ value: 'PR', label: this.translate( 'Puerto Rico' ) },
			{ value: 'VI', label: this.translate( 'Virgin Islands' ) }
		];

		stateGroup = [
			{ label: this.translate( 'States' ), options: states },
			{ label: this.translate( 'Territories' ), options: territories }
		];

		return (
			<SelectOptGroups optGroups={ stateGroup } {...this.props} />
		);
	}
});

module.exports = USStateSelector;
