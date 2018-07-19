/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize, moment } from 'i18n-calypso';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import Confirmation from '../shared/confirmation';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

class PendingAppointment extends Component {
	static propTypes = {
		nextAppointment: PropTypes.object.isRequired,
		site: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_pending_appointment' );
	}

	render() {
		const { translate } = this.props;
		const beginTimestamp = moment( this.props.nextAppointment.beginTimestamp ).format( 'LLLL' );

		return (
			<div>
				<Confirmation
					description={ translate( "It's scheduled for %(time)s.", {
						args: {
							time: beginTimestamp,
						},
					} ) }
					title={ translate( 'You have a pending appointment' ) }
				>
					<Button
						className="pending-appointment__reschedule-button"
						href={ `/me/concierge/${ this.props.site.slug }/${
							this.props.nextAppointment.id
						}/reschedule` }
					>
						{ translate( 'Reschedule session' ) }
					</Button>

					<Button
						className="pending-appointment__confirmation-button"
						primary={ true }
						scary={ true }
						href={ `/me/concierge/${ this.props.site.slug }/${
							this.props.nextAppointment.id
						}/cancel` }
					>
						{ translate( 'Cancel session' ) }
					</Button>
				</Confirmation>
			</div>
		);
	}
}

export default connect(
	state => ( {
		nextAppointment: getConciergeNextAppointment( state ),
	} ),
	{ recordTracksEvent }
)( localize( PendingAppointment ) );
