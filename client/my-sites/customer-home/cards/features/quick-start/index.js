/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { connect } from 'react-redux';
import 'moment-timezone';

/**
 * Internal dependencies
 */
import HappinessEngineersTray from 'components/happiness-engineers-tray';
import CardHeading from 'components/card-heading';
import {
	withAnalytics,
	composeAnalytics,
	recordTracksEvent,
	bumpStat,
} from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryConciergeInitial from 'components/data/query-concierge-initial';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const QuickStart = ( {
	bookASession,
	moment,
	nextSession,
	reschedule,
	siteId,
	siteSlug,
	translate,
	viewDetails,
} ) => {
	return nextSession ? (
		<Card className="quick-start next-session">
			<HappinessEngineersTray />
			<CardHeading>{ translate( 'Your scheduled Quick Start support session' ) }</CardHeading>
			<table>
				<thead>
					<tr>
						<th>{ translate( 'Date' ) }</th>
						<th>{ translate( 'Time' ) }</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{ moment( nextSession.beginTimestamp ).format( 'LL' ) }</td>
						<td>{ moment.tz( nextSession.beginTimestamp, moment.tz.guess() ).format( 'LT z' ) }</td>
					</tr>
				</tbody>
			</table>
			<Button onClick={ () => viewDetails( siteSlug ) }>{ translate( 'View details' ) }</Button>
			<Button
				className={ 'quick-start__reschedule' }
				href={ `/me/concierge/${ siteSlug }/book` }
				onClick={ () => reschedule( siteSlug, nextSession.id ) }
				borderless
			>
				{ translate( 'Reschedule' ) }
			</Button>
			{ /* <a
				
				onClick={ () => reschedule( siteSlug, nextSession.id ) }
			>
				{ translate( 'Reschedule' ) }
			</a> */ }
		</Card>
	) : (
		<>
			{ siteId && <QueryConciergeInitial siteId={ siteId } /> }
			<Card className="quick-start book-session">
				<HappinessEngineersTray />
				<CardHeading>{ translate( 'Schedule time with an expert' ) }</CardHeading>
				<p>
					{ translate(
						'Need help with your site? Set up a video call to get hands-on 1-on-1 support.'
					) }
				</p>
				<Button onClick={ () => bookASession( siteSlug ) }>
					{ translate( 'Book a session' ) }
				</Button>
			</Card>
		</>
	);
};

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
		nextSession: getConciergeNextAppointment( state ),
	} ),
	( dispatch ) => ( {
		bookASession: ( siteSlug ) =>
			dispatch(
				withAnalytics(
					composeAnalytics(
						recordTracksEvent( 'calypso_customer_home_quick_start_book_a_session_click', {
							siteSlug: siteSlug,
						} ),
						bumpStat( 'calypso_customer_home', 'book_quick_start_session' )
					),
					navigate( `/me/concierge/${ siteSlug }/book` )
				)
			),
		viewDetails: ( siteSlug ) =>
			dispatch(
				withAnalytics(
					composeAnalytics(
						recordTracksEvent( 'calypso_customer_home_quick_start_view_details_click', {
							siteSlug: siteSlug,
						} ),
						bumpStat( 'calypso_customer_home', 'view_quick_start_session_details' )
					),
					navigate( `/me/concierge/${ siteSlug }/book` )
				)
			),
		reschedule: ( siteSlug, sessionId ) =>
			dispatch(
				withAnalytics(
					composeAnalytics(
						recordTracksEvent( 'calypso_customer_home_quick_start_reschedule_click', {
							siteSlug: siteSlug,
						} ),
						bumpStat( 'calypso_customer_home', 'reschedule_quick_start_session' )
					),
					navigate( `/me/concierge/${ siteSlug }/${ sessionId }/cancel` )
				)
			),
	} )
)( localize( withLocalizedMoment( QuickStart ) ) );
