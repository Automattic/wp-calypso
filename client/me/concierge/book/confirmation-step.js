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
import analytics from 'lib/analytics';

class ConfirmationStep extends Component {
	componentDidMount() {
		analytics.tracks.recordEvent( 'calypso_concierge_book_confirmation_step' );
	}

	render() {
		const { site, translate } = this.props;

		return (
			<Confirmation
				buttonLabel={ translate( 'Return to your dashboard' ) }
				buttonUrl={ `/stats/day/${ site.slug }` }
				description={ translate(
					'We will send you an email with information on how to get prepared.'
				) }
				title={ translate( 'Your Concierge session is booked!' ) }
			/>
		);
	}
}

export default localize( ConfirmationStep );
