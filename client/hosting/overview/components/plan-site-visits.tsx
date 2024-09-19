import { LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState } from 'react'; // eslint-disable-line no-unused-vars -- used in the jsdoc types
import wpcom from 'calypso/lib/wp';
import './style.scss';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteSlug } from 'calypso/state/sites/selectors';

interface PlanSiteVisitsProps {
	siteId: number;
}

interface VisitResponse {
	data: [ string, number ][];
}

export function PlanSiteVisits( { siteId }: PlanSiteVisitsProps ) {
	const dispatch = useDispatch();
	const [ visitsNumber, setVisitsNumber ] = useState< number | null >( null );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const canViewStat = useSelector( ( state ) => canCurrentUser( state, siteId, 'publish_posts' ) );

	const translate = useTranslate();

	useEffect( () => {
		// It's possible to go with `unit: month` and `quantity: 1` to get the last month's data
		// but I tested thoroughly - it doesn't work for this case, since looks like it doesn't include the current (today) day,
		// and additionally it provides extra info about previous month, if, for example, `date` is the first day of the month (e.g. "2024-07-01")
		// so I decided that it worth to make extra calculations (get specific days and sum them) to be explicit and ensure that rendered data is correct
		// -----------------
		// Also, I considered option to use getHighlights[ PAST_THIRTY_DAYS ], but according to my investigation - it totally doesn't work for our case:
		// 1) It doesn't include current day
		// 2) It counts not calendar month, but 30 days from the "yesterday"
		const todayDate = moment().format( 'YYYY-MM-DD' );
		const numberOfDays = todayDate.split( '-' ).pop();
		wpcom.req
			.get( `/sites/${ siteId }/stats/visits`, {
				unit: 'day',

				quantity: numberOfDays,
				date: todayDate,
				stat_fields: 'views',
			} )
			.then( ( result: VisitResponse ) => {
				const views = result.data.reduce(
					( acc: number, [ , curr ]: [ string, number ] ) => acc + curr,
					0
				);

				setVisitsNumber( views );
			} );
	}, [ siteId ] );

	if ( ! canViewStat ) {
		return;
	}

	const getSiteVisitsContent = () => {
		if ( visitsNumber === 0 ) {
			return translate( 'No visits so far this month', {
				comment: 'A notice that the site has not yet received any visits during the current month',
			} );
		}

		if ( ! visitsNumber ) {
			return <LoadingPlaceholder className="hosting-overview__plan-site-visits-placeholder" />;
		}

		return translate( '%(visitCount)s this month', {
			args: { visitCount: visitsNumber },
			comment: 'A description of the number of visits the site has received in the current month',
		} );
	};

	return (
		<div className="hosting-overview__plan-site-visits">
			<div className="hosting-overview__plan-site-visits-title-wrapper">
				<div className="hosting-overview__plan-site-visits-title">
					{ translate( 'Visits', {
						comment: 'The title of the site visits section of site stats',
					} ) }
				</div>
				<div className="hosting-overview__site-metrics-unlimited">
					{ translate( 'Unlimited', { comment: 'An indicator that bandwidth is unlimited' } ) }
				</div>
			</div>
			<div className="hosting-overview__plan-site-visits-content">{ getSiteVisitsContent() }</div>
			<a
				href={ `/stats/month/${ siteSlug }` }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_hosting_overview_visit_stats_click' ) );
				} }
			>
				{ translate( 'Visit stats', {
					comment: 'A link taking the user to more detailed site statistics',
				} ) }
			</a>
		</div>
	);
}
