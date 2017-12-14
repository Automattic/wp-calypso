/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import { localize } from 'i18n-calypso';

class ConfirmationStep extends Component {
	render() {
		const { site, translate } = this.props;
		return (
			<Card>
				<img
					className="concierge__confirmation-illustration"
					src={ '/calypso/images/illustrations/support.svg' }
				/>

				<FormattedHeader
					headerText={ translate( 'Your Concierge session is booked!' ) }
					subHeaderText={ translate(
						'We will send you an email with information on how to get prepared.'
					) }
				/>

				<Button
					className="concierge__confirmation-button"
					primary={ true }
					href={ `/stats/day/${ site.slug }` }
				>
					{ translate( 'Return to your dashboard' ) }
				</Button>
			</Card>
		);
	}
}

export default localize( ConfirmationStep );
