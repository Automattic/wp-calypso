/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class SettingsPaymentsLocationCurrency extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Store location and currency' ) } />
				<Card>
					{
						translate(
							'Different payment methods may be available based on your store location and currency.'
						)
					}
				</Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsLocationCurrency );
