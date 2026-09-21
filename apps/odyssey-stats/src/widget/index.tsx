import '@automattic/calypso-polyfills';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from '@wordpress/element';
import { trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import config from '../lib/config-api';
import {
	DEFAULT_DATE_RANGE_ID,
	DateRangeId,
	getDateRange,
	isDateRangeId,
} from '../lib/date-ranges';
import getExploreMoreUrl from '../lib/get-explore-more-url';
import getSiteAdminUrl from '../lib/selectors/get-site-admin-url';
import getSiteStatsBaseUrl from '../lib/selectors/get-site-stats-base-url';
import setLocale from '../lib/set-locale';
import DateRangeControl from './date-range-control';
import Highlights from './highlights';
import MiniChart from './mini-chart';
import Modules from './modules';
import WidgetSection from './widget-section';
import type { FunctionComponent } from 'react';

import './index.scss';

// Per site, matching the convention the full Stats app uses for its chart type
// preference (`jetpack_stats_chart_type_<siteId>`).
const rangeStorageKey = ( siteId: number ) => `jetpack_stats_widget_date_range_${ siteId }`;

/**
 * Read the stored range for a site, falling back to the default.
 * @param siteId The current site id.
 */
function readStoredRangeId( siteId: number ): DateRangeId {
	try {
		const stored = localStorage.getItem( rangeStorageKey( siteId ) );
		return isDateRangeId( stored ) ? stored : DEFAULT_DATE_RANGE_ID;
	} catch {
		// `localStorage` throws outright where site data is blocked; fall back quietly.
		return DEFAULT_DATE_RANGE_ID;
	}
}

/**
 * Persist the selected range for a site.
 * @param siteId The current site id.
 * @param id     The range to remember.
 */
function storeRangeId( siteId: number, id: DateRangeId ) {
	try {
		localStorage.setItem( rangeStorageKey( siteId ), id );
	} catch {
		// Remembering the choice is a convenience, not a requirement.
	}
}

/**
 * Loads and runs the main chunk for Stats Widget.
 */
export function init() {
	const currentSiteId = config( 'blog_id' );
	const localeSlug = config( 'i18n_locale_slug' ) || config( 'i18n_default_locale_slug' ) || 'en';

	const statsBaseUrl = getSiteStatsBaseUrl();
	const adminBaseUrl = getSiteAdminUrl( currentSiteId );
	const exploreMoreUrl = getExploreMoreUrl( `${ statsBaseUrl }/stats/day/${ currentSiteId }` );

	const queryClient = new QueryClient();

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () => {
		const statsWidgetEl = document.getElementById( 'dashboard_stats' );
		if ( ! statsWidgetEl ) {
			return;
		}
		const App: FunctionComponent = () => {
			const translate = useTranslate();
			const customTheme = useWPAdminTheme();
			// One range drives both the chart and the highlights, so they can never
			// describe different windows.
			const [ rangeId, setRangeId ] = useState< DateRangeId >( () =>
				readStoredRangeId( currentSiteId )
			);
			const range = getDateRange( rangeId );

			const onRangeChange = ( nextRangeId: DateRangeId ) => {
				setRangeId( nextRangeId );
				storeRangeId( currentSiteId, nextRangeId );
			};

			return (
				<div
					id="stats-widget-content"
					className={ clsx( 'stats-widget-content', 'color-scheme', customTheme ) }
				>
					<div className="stats-widget-wrapper">
						<WidgetSection
							title={ translate( 'Overview' ) }
							icon={ trendingUp }
							className="stats-widget-overview"
							action={ <DateRangeControl value={ rangeId } onChange={ onRangeChange } /> }
						>
							<MiniChart
								siteId={ currentSiteId }
								gmtOffset={ config( 'gmt_offset' ) }
								statsBaseUrl={ statsBaseUrl }
								range={ range }
							/>
						</WidgetSection>
						<Highlights
							siteId={ currentSiteId }
							gmtOffset={ config( 'gmt_offset' ) }
							statsBaseUrl={ statsBaseUrl }
							range={ range }
						/>
						<Modules siteId={ currentSiteId } adminBaseUrl={ adminBaseUrl } />
						<div className="stats-widget-footer">
							<a
								href="https://jetpack.com/redirect/?source=jetpack-stats-widget-logo-link"
								target="_blank"
								rel="noreferrer noopener"
								aria-label="Jetpack Stats Website"
							>
								<JetpackLogo size={ 20 } monochrome full />
							</a>
							<a href={ exploreMoreUrl }>{ translate( 'Explore more' ) }</a>
						</div>
					</div>
				</div>
			);
		};
		const root = createRoot( statsWidgetEl );
		root.render(
			<QueryClientProvider client={ queryClient }>
				<App />
			</QueryClientProvider>
		);
	} );
}
