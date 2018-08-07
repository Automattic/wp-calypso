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
import CompactCard from 'components/card/compact';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import PrimaryHeader from '../shared/primary-header';
import Site from 'blocks/site';
import { cancelLink, rescheduleLink } from '../utils';
import { localize, moment } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

class PendingAppointment extends Component {
	static propTypes = {
		nextAppointment: PropTypes.object.isRequired,
		site: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_pending_appointment_view' );
	}

	render() {
		const { nextAppointment, site, translate } = this.props;

		const appointmentDateTime = moment( nextAppointment.beginTimestamp )
			.tz( nextAppointment.meta.timezone )
			.format( 'LLLL z' );

		return (
			<div>
				<PrimaryHeader />

				<CompactCard className="pending-appointment__detail-block">
					<p>
						{ translate( 'Your upcoming appointment is %(dateTime)s.', {
							args: {
								dateTime: appointmentDateTime,
							},
						} ) }
					</p>

					<Site siteId={ site.id } />

					<p>{ translate( "Here's what you told us:" ) }</p>

					<p>
						{ translate( '{{strong}}What are you hoping to accomplish with your site?{{/strong}}', {
							components: {
								strong: <strong />,
							},
						} ) }
						<br />
						{ nextAppointment.meta.message }
					</p>

					<p>
						{ translate(
							'If needed you can {{reschedule}}reschedule{{/reschedule}} or {{cancel}}cancel{{/cancel}} this session.',
							{
								components: {
									cancel: <a href={ cancelLink( site, nextAppointment ) } />,
									reschedule: <a href={ rescheduleLink( site, nextAppointment ) } />,
								},
							}
						) }
					</p>
				</CompactCard>
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
