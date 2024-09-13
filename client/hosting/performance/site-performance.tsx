import page from '@automattic/calypso-router';
import { useDebouncedInput } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { useDispatch, useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { requestSiteStats } from 'calypso/state/stats/lists/actions';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PageSelector } from './components/PageSelector';
import { PerformanceReport } from './components/PerformanceReport';
import { DeviceTabControls, Tab } from './components/device-tab-control';
import { useSitePages } from './hooks/useSitePages';

import './style.scss';

const statType = 'statsTopPosts';

const statsQuery = {
	num: -1,
	summarize: 1,
	period: 'day',
	date: moment().format( 'YYYY-MM-DD' ),
	max: 0,
};

export const SitePerformance = () => {
	const [ activeTab, setActiveTab ] = useState< Tab >( 'mobile' );

	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const stats = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, statsQuery )
	) as { id: number; value: number }[];

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteStats( siteId, statType, statsQuery ) );
	}, [ dispatch, siteId ] );

	const queryParams = useSelector( getCurrentQueryArguments );
	const [ , setQuery, query ] = useDebouncedInput();
	const pages = useSitePages( { query } );

	const orderedPages = useMemo( () => {
		return [ ...pages ].sort( ( a, b ) => {
			const aVisits = stats.find( ( { id } ) => id === parseInt( a.value, 10 ) )?.value ?? 0;
			const bVisits = stats.find( ( { id } ) => id === parseInt( b.value, 10 ) )?.value ?? 0;
			return bVisits - aVisits;
		} );
	}, [ pages, stats ] );

	const currentPageId = queryParams?.page_id?.toString();

	const wpcom_performance_url = useMemo( () => {
		return pages.find( ( page ) => page.value === currentPageId )?.wpcom_performance_url;
	}, [ pages, currentPageId ] );

	return (
		<div className="site-performance">
			<div className="site-performance-device-tab-controls__container">
				<NavigationHeader
					className="site-performance__navigation-header"
					title={ translate( 'Performance' ) }
					subtitle={ translate(
						'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
						{
							components: {
								link: <InlineSupportLink supportContext="site-monitoring" showIcon={ false } />,
							},
						}
					) }
				/>
				<PageSelector
					onFilterValueChange={ setQuery }
					options={ orderedPages }
					onChange={ ( page_id ) => {
						const url = new URL( window.location.href );

						if ( page_id ) {
							url.searchParams.set( 'page_id', page_id );
						} else {
							url.searchParams.delete( 'page_id' );
						}

						page.replace( url.pathname + url.search );
					} }
					value={ currentPageId }
				/>
				<DeviceTabControls onDeviceTabChange={ setActiveTab } value={ activeTab } />
			</div>
			<PerformanceReport wpcom_performance_url={ wpcom_performance_url } activeTab={ activeTab } />
		</div>
	);
};
