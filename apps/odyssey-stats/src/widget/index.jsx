import '../load-config';
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import setLocale from '../lib/set-locale';
import Highlights from './highlights';
import MiniChart from './mini-chart';
import Modules from './modules';

import 'calypso/assets/stylesheets/style.scss';
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
					<div className="stats-widget-highlights-wrapper">
						<Highlights
							siteId={ currentSiteId }
							gmtOffset={ config( 'gmt_offset' ) }
							odysseyStatsBaseUrl={ odysseyStatsBaseUrl }
						/>
						<Modules />
					</div>
				</div>
			</QueryClientProvider>,
			document.getElementById( 'dashboard_stats' )
		)
	);
}
