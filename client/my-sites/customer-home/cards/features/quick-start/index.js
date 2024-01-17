import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import { HappinessEngineersTray } from 'calypso/components/happiness-engineers-tray';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { composeAnalytics, recordTracksEvent, bumpStat } from 'calypso/state/analytics/actions';
import getConciergeNextAppointment from 'calypso/state/selectors/get-concierge-next-appointment';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import 'moment-timezone';
import './style.scss';

const QuickStart = ( { nextSession, reschedule, siteId, siteSlug, viewDetails } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	return (
		<>
			{ siteId && <QueryConciergeInitial siteId={ siteId } /> }
			<Card className="quick-start next-session customer-home__card">
				<HappinessEngineersTray />
				<CardHeading>{ translate( 'Your scheduled Quick Start support session:' ) }</CardHeading>
				<table>
					<thead>
						<tr>
							<th>{ translate( 'Date' ) }</th>
							<th>{ translate( 'Time' ) }</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								{ nextSession ? (
									moment( nextSession.beginTimestamp ).format( 'LL' )
								) : (
									<div className="quick-start__placeholder"></div>
								) }
							</td>
							<td>
								{ nextSession ? (
									moment.tz( nextSession.beginTimestamp, moment.tz.guess() ).format( 'LT z' )
								) : (
									<div className="quick-start__placeholder"></div>
								) }
							</td>
						</tr>
					</tbody>
				</table>
				<div className="quick-start__buttons">
					<Button disabled={ ! nextSession } onClick={ () => viewDetails( siteId, siteSlug ) }>
						{ translate( 'View details' ) }
					</Button>
					<Button
						className="quick-start__reschedule"
						onClick={ () => reschedule( siteId, siteSlug, nextSession.id ) }
						borderless
						disabled={ ! nextSession }
					>
						{ translate( 'Reschedule' ) }
					</Button>
				</div>
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
	{
		viewDetails: ( siteId, siteSlug ) => ( dispatch ) => {
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_quick_start_view_details_click', {
						site_id: siteId,
					} ),
					bumpStat( 'calypso_customer_home', 'view_quick_start_session_details' )
				)
			);
			page( `/me/quickstart/${ siteSlug }/book` );
		},
		reschedule: ( siteId, siteSlug, sessionId ) => ( dispatch ) => {
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_quick_start_reschedule_click', {
						site_id: siteId,
					} ),
					bumpStat( 'calypso_customer_home', 'reschedule_quick_start_session' )
				)
			);
			page( `/me/quickstart/${ siteSlug }/${ sessionId }/cancel` );
		},
	}
)( QuickStart );
