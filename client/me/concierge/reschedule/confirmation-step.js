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
				description={ translate( 'We will send you an email with the updated calendar event.' ) }
				site={ site }
				title={ translate( 'Your Concierge session has been rescheduled!' ) }
			/>
		);
	}
}

export default localize( ConfirmationStep );
