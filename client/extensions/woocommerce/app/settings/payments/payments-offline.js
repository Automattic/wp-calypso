/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtendedHeader from '../../../components/extended-header';

class SettingsPaymentsOffline extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Offline payment methods' ) }
					description={
						translate(
							'Allow customers to pay you manually using methods like bank ' +
							'transfer, check or cash on delivery.'
						)
					} />
				<Card></Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffline );
