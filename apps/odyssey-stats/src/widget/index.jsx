import '@automattic/calypso-polyfills';
import { translate } from 'i18n-calypso';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import JetpackLogo from 'calypso/components/jetpack-logo';
import config from '../lib/config-api';
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
	const odysseyStatsBaseUrl = config( 'odyssey_stats_base_url' );
	const queryClient = new QueryClient();

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () =>
		render(
			<QueryClientProvider client={ queryClient }>
				<div id="stats-widget-content" className="stats-widget-content">
					<MiniChart
						siteId={ currentSiteId }
						gmtOffset={ config( 'gmt_offset' ) }
						odysseyStatsBaseUrl={ odysseyStatsBaseUrl }
					/>
					<div className="stats-widget-wrapper">
						<Highlights
							siteId={ currentSiteId }
							gmtOffset={ config( 'gmt_offset' ) }
							odysseyStatsBaseUrl={ odysseyStatsBaseUrl }
						/>
						<Modules siteId={ currentSiteId } />
						<div className="stats-widget-footer">
							<a
								href="https://jetpack.com/redirect/?source=jetpack-stats-widget-logo-link"
								target="__blank"
								aria-label="Jetpack Stats Website"
							>
								<JetpackLogo size={ 25 } monochrome full />
							</a>
							<a href={ odysseyStatsBaseUrl }>{ translate( 'View all stats' ) }</a>
						</div>
					</div>
				</div>
			</QueryClientProvider>,
			document.getElementById( 'dashboard_stats' )
		)
	);
}
