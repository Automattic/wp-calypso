/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Confirmation from '../shared/confirmation';
import { recordTracksEvent } from 'state/analytics/actions';

class ConfirmationStep extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_confirmation_step' );
	}

	render() {
		const { site } = this.props;

		return (
			<Confirmation
				description={
					'We will send you a calendar invitation and an email with information on how to prepare.'
				}
				title={ 'Your Concierge session is booked!' }
			>
				<Button
					className="book__schedule-button"
					href={ `/stats/day/${ site.slug }` }
					primary={ true }
				>
					{ 'Return to your dashboard' }
				</Button>
			</Confirmation>
		);
	}
}

export default connect( null, { recordTracksEvent } )( ConfirmationStep );
