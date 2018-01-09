/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Confirmation from '../shared/confirmation';

class ConfirmationStep extends Component {
	render() {
		const { site, translate } = this.props;

		return (
			<Confirmation
				confirmationButton={ translate( 'Return to your dashboard' ) }
				confirmationDescription={ translate(
					'We will send you an email with information on how to get prepared.'
				) }
				confirmationTitle={ translate( 'Your Concierge session is booked!' ) }
				site={ site }
			/>
		);
	}
}

export default localize( ConfirmationStep );
