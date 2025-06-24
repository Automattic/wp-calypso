import { LoadingPlaceholder } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useLayoutEffect, useState } from 'react'; // eslint-disable-line no-unused-vars -- used in the jsdoc types
import { untrailingslashit } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import { requestSite } from 'calypso/state/sites/actions';
import {
	getSiteAdminUrl,
	getSiteSlug,
	isAdminInterfaceWPAdmin,
	isJetpackModuleActive,
} from 'calypso/state/sites/selectors';

interface PlanSiteVisitsProps {
	siteId: number;
}

interface VisitAPIResponse {
	data: [ string, number ][];
}

type VisitResponse = number | 'loading' | 'disabled' | 'error';

export function PlanSiteVisits( { siteId }: PlanSiteVisitsProps ) {
	const dispatch = useDispatch();
	const [ visitsResponse, setVisitsResponse ] = useState< VisitResponse >( 'loading' );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const canViewStat = useSelector( ( state ) => canCurrentUser( state, siteId, 'publish_posts' ) );

	const translate = useTranslate();

	const isEnablingStats = useSelector( ( state ) =>
		isActivatingJetpackModule( state, siteId, 'stats' )
	);

	const fetchVisits = useCallback( () => {
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

		setVisitsResponse( 'loading' );

		wpcom.req
			.get( `/sites/${ siteId }/stats/visits`, {
				unit: 'day',

				quantity: numberOfDays,
				date: todayDate,
				stat_fields: 'views',
			} )
			.then( ( result: VisitAPIResponse ) => {
				const views = result.data.reduce(
					( acc: number, [ , curr ]: [ string, number ] ) => acc + curr,
					0
				);

				setVisitsResponse( views );
			} )
			.catch( ( e: Error ) => {
				if ( e.name === 'InvalidBlogError' ) {
					setVisitsResponse( 'disabled' );
				} else {
					setVisitsResponse( 'error' );
				}
			} );
	}, [ siteId ] );

	const hasModuleActive =
		useSelector( ( state ) => isJetpackModuleActive( state, siteId, 'stats' ) ) ?? false;

	useLayoutEffect( () => {
		fetchVisits();
	}, [ fetchVisits, hasModuleActive ] );

	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const adminInterfaceIsWPAdmin = useSelector( ( state ) =>
		isAdminInterfaceWPAdmin( state, siteId )
	);

	if ( ! canViewStat ) {
		return null;
	}

	const getSiteVisitsContent = () => {
		if ( visitsResponse === 'loading' ) {
			return <LoadingPlaceholder className="plan-site-visits-placeholder" />;
		}

		if ( visitsResponse === 'error' ) {
			return translate( 'Error loading visits', {
				comment: 'A message that the visits are not loaded',
			} );
		}

		if ( visitsResponse === 'disabled' ) {
			return translate( 'Stats are disabled', {
				comment: 'A message that the stats are disabled',
			} );
		}

		if ( visitsResponse === 0 ) {
			return translate( 'No visits so far this month', {
				comment: 'A notice that the site has not yet received any visits during the current month',
			} );
		}

		return translate( '%(visitCount)s this month', {
			args: { visitCount: visitsResponse },
			comment: 'A description of the number of visits the site has received in the current month',
		} );
	};

	const getSiteVisitsCTA = () => {
		if ( visitsResponse === 'disabled' ) {
			return (
				<Button
					variant="link"
					disabled={ !! isEnablingStats }
					css={ { textDecoration: 'none !important', fontSize: 'inherit' } }
					onClick={ async () => {
						dispatch( recordTracksEvent( 'calypso_hosting_overview_visit_stats_enable_click' ) );

						try {
							await dispatch( activateModule( siteId, 'stats' ) );

							dispatch(
								recordTracksEvent( 'calypso_hosting_overview_visit_stats_enable_success' )
							);

							setVisitsResponse( 'loading' );
						} catch ( e: unknown ) {
							if ( e instanceof Error ) {
								dispatch(
									recordTracksEvent( 'calypso_hosting_overview_visit_stats_enable_error', {
										error: e.message,
									} )
								);
							}
						}

						dispatch( requestSite( siteId ) );
					} }
				>
					{ isEnablingStats
						? translate( 'Enabling stats…', {
								comment: 'A message that stats are being enabled',
						  } )
						: translate( 'Enable stats', {
								comment: 'A button that enables stats for the site',
						  } ) }
				</Button>
			);
		}

		if ( visitsResponse === 'error' ) {
			return (
				<Button
					variant="link"
					css={ { textDecoration: 'none !important', fontSize: 'inherit' } }
					onClick={ () => {
						fetchVisits();
						dispatch( recordTracksEvent( 'calypso_hosting_overview_visit_stats_try_again_click' ) );
					} }
				>
					{ translate( 'Try again' ) }
				</Button>
			);
		}

		const statsPageUrl =
			adminInterfaceIsWPAdmin && siteAdminUrl
				? `${ untrailingslashit( siteAdminUrl ) }/admin.php?page=stats#!/stats/month/${ siteId }`
				: `/stats/month/${ siteSlug }`;

		return (
			<a
				href={ statsPageUrl }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_hosting_overview_visit_stats_click' ) );
				} }
			>
				{ translate( 'Visit stats', {
					comment: 'A link taking the user to more detailed site statistics',
				} ) }
			</a>
		);
	};

	return (
		<div className="plan-site-visits">
			<div className="plan-site-visits-title-wrapper">
				<div className="plan-site-visits-title">
					{ translate( 'Visits', {
						comment: 'The title of the site visits section of site stats',
					} ) }
				</div>
				<div className="site-metrics-unlimited">
					{ translate( 'Unlimited', { comment: 'An indicator that bandwidth is unlimited' } ) }
				</div>
			</div>
			<div className="plan-site-visits-content">{ getSiteVisitsContent() }</div>
			{ getSiteVisitsCTA() }
		</div>
	);
}
