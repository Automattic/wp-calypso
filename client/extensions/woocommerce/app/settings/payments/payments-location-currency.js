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

class SettingsPaymentsLocationCurrency extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Store location and currency' ) }
					description={
						translate(
							'Different payment methods may be available based on your store' +
							'location and currency.'
						)
					} />
				<Card></Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsLocationCurrency );
