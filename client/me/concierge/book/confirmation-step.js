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
				buttonLabel={ translate( 'Return to your dashboard' ) }
				description={ translate(
					'We will send you an email with information on how to get prepared.'
				) }
				site={ site }
				title={ translate( 'Your Concierge session is booked!' ) }
			/>
		);
	}
}

export default localize( ConfirmationStep );
