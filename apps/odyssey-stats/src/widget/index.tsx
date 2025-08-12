import '@automattic/calypso-polyfills';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { createRoot } from 'react-dom/client';
import JetpackLogo from 'calypso/components/jetpack-logo';
import config from '../lib/config-api';
import getSiteAdminUrl from '../lib/selectors/get-site-admin-url';
import getSiteStatsBaseUrl from '../lib/selectors/get-site-stats-base-url';
import setLocale from '../lib/set-locale';
import Highlights from './highlights';
import MiniChart from './mini-chart';
import Modules from './modules';

import './index.scss';

/**
 * Loads and runs the main chunk for Stats Widget.
 */
export function init() {
	const currentSiteId = config( 'blog_id' );
	const localeSlug = config( 'i18n_locale_slug' ) || config( 'i18n_default_locale_slug' ) || 'en';

	const statsBaseUrl = getSiteStatsBaseUrl();
	const adminBaseUrl = getSiteAdminUrl( currentSiteId );

	const queryClient = new QueryClient();

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () => {
		const statsWidgetEl = document.getElementById( 'dashboard_stats' );
		if ( ! statsWidgetEl ) {
			return;
		}
		const App: FunctionComponent = () => {
			const translate = useTranslate();
			return (
				<div id="stats-widget-content" className="stats-widget-content">
					<MiniChart
						siteId={ currentSiteId }
						gmtOffset={ config( 'gmt_offset' ) }
						statsBaseUrl={ statsBaseUrl }
					/>
					<div className="stats-widget-wrapper">
						<Highlights
							siteId={ currentSiteId }
							gmtOffset={ config( 'gmt_offset' ) }
							statsBaseUrl={ statsBaseUrl }
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
							<a href={ `${ statsBaseUrl }/stats/day/${ currentSiteId }` }>
								{ translate( 'View all stats' ) }
							</a>
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
