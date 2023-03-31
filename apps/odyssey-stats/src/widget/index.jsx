import '../load-config';
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import moment from 'moment';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import setLocale from '../lib/set-locale';
import Main from './main';

import 'calypso/assets/stylesheets/style.scss';
import './style.scss';

/**
 * Loads and runs the main chunk for Stats Widget.
 */
export function init() {
	const currentSiteId = config( 'blog_id' );
	const queryClient = new QueryClient();
	const localeSlug = config( 'i18n_locale_slug' ) || config( 'i18n_default_locale_slug' ) || 'en';

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () =>
		render(
			<QueryClientProvider client={ queryClient }>
				<div>
					<Main siteId={ currentSiteId } />
				</div>
			</QueryClientProvider>,
			document.getElementById( 'dashboard_stats' )
		)
	);
}
