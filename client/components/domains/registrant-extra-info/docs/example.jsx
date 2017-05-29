/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
const countriesList = require( 'lib/countries-list' ).forDomainRegistrations(),
	Card = require( 'components/card' ),
	ExtraInfoFrForm = require( 'components/domains/registrant-extra-info/fr-form' ).default;

class ExtraInfoFrFormExample extends PureComponent {
	static displayName = 'DomainsFrExtraForm'

	constructor( props ) {
		super( props );

		this.state = {
			registrantExtraInfo: {},
		};
	}

	handleExtraChange = ( registrantExtraInfo ) => {
		this.setState( { registrantExtraInfo } );
	}

	render() {
		return (
			<div>
				<p>
					The Fr Extra Registrant Information form collects the extra data
					required by AFNIC.
				</p>

				<Card>
					<ExtraInfoFrForm
						values={ this.state.registrantExtraInfo }
						countriesList={ countriesList }
						onStateChange={ this.handleExtraChange } >
					</ExtraInfoFrForm>
				</Card>
			</div>
		);
	}
}

module.exports = ExtraInfoFrFormExample;
