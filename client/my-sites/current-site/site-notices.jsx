import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * SiteNotices component that renders all the notices related to a site
 * This includes domain warnings, site notices, and stale cart items
 */
function SiteNotices() {
	const selectedSite = useSelector( getSelectedSite );

	if ( ! selectedSite ) {
		return null;
	}

	return (
		<>
			{ isEnabled( 'current-site/domain-warning' ) && (
				<AsyncLoad
					require={ () =>
						import(
							/* webpackChunkName: "async-load-calypso-my-sites-current-site-domain-warnings" */ './domain-warnings'
						)
					}
					placeholder={ null }
				/>
			) }
			{ isEnabled( 'current-site/notice' ) && (
				<AsyncLoad
					require={ () =>
						import(
							/* webpackChunkName: "async-load-calypso-my-sites-current-site-notice" */ './notice'
						)
					}
					placeholder={ null }
					site={ selectedSite }
				/>
			) }
		</>
	);
}

export default SiteNotices;
