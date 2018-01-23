/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import Confirmation from '../shared/confirmation';
import analytics from 'lib/analytics';

class ConfirmationStep extends Component {
	componentDidMount() {
		analytics.tracks.recordEvent( 'calypso_concierge_reschedule_confirmation_step' );
	}

	render() {
		const { site, translate } = this.props;

		return (
			<Confirmation
				description={ translate(
					'We will send you an email with information on how to get prepared.'
				) }
				title={ translate( 'Your Concierge session has been rescheduled!' ) }
			>
				<Button
					className="reschedule__schedule-button"
					href={ `/stats/day/${ site.slug }` }
					primary={ true }
				>
					{ translate( 'Return to your dashboard' ) }
				</Button>
			</Confirmation>
		);
	}
}

export default localize( ConfirmationStep );
