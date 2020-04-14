/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { connect } from 'react-redux';

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

/**
 * Style dependencies
 */
import './style.scss';

const QuickStartCard = ( {
	translate,
	siteId,
	siteSlug,
	nextSession,
	bookASession,
	viewDetails,
	reschedule,
} ) => {
	return nextSession ? (
		<Card className="quick-start next-session">
			<HappinessEngineersTray />
			<CardHeading>{ translate( 'Your scheduled Quick Start support session' ) }</CardHeading>
			<div className="quick-start__date">
				{ translate( 'Date' ) }
				{ nextSession.beginTimestamp }
			</div>
			<div className="quick-start__time">
				{ translate( 'Time' ) }
				{ nextSession.beginTimestamp }
			</div>
			<Button onClick={ () => viewDetails( siteSlug ) }>{ translate( 'View details' ) }</Button>
			<Button onClick={ () => reschedule( siteSlug, nextSession.id ) }>
				{ translate( 'Reschedule' ) }
			</Button>
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
	state => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
		nextSession: getConciergeNextAppointment( state ),
	} ),
	dispatch => ( {
		bookASession: siteSlug =>
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
		viewDetails: siteSlug =>
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
)( localize( QuickStartCard ) );
