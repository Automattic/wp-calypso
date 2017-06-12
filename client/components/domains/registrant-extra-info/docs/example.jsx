/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtraInfoFrForm from 'components/domains/registrant-extra-info/fr-form';
import { forDomainRegistrations as getCountries } from 'lib/countries-list';
const countriesList = getCountries();

class ExtraInfoFrFormExample extends PureComponent {
	state = {
		registrantExtraInfo: {},
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

export default ExtraInfoFrFormExample;
