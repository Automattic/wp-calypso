import config from '@automattic/calypso-config';
import { Page } from '@wordpress/admin-ui';
import clsx from 'clsx';
import { ReactNode } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main, { MainProps } from 'calypso/components/main';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import StatsUpsellModal from 'calypso/my-sites/stats/stats-upsell-modal';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getUpsellModalView } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STATS_HEADER_TITLE } from '../../constants';

interface StatsMainProps extends MainProps {
	/** Subtitle shown below the page title in the unified header. */
	pageSubTitle?: string;
	/** Optional actions to display on the right side of the unified header. */
	pageActions?: ReactNode;
	/** Navigation tabs rendered as the first child inside the Page header area. */
	pageTabs?: ReactNode;
}

export default function StatsMain( {
	children,
	className,
	pageSubTitle,
	pageActions,
	pageTabs,
	...props
}: StatsMainProps ) {
	const isWPAdminAndNotSimpleSite = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) as number;
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const customTheme = useWPAdminTheme( isSiteJetpack );

	// Make the upsell modal view available on all Stats pages.
	const upsellModalView = useSelector( ( state ) => getUpsellModalView( state, siteId ) );

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme, className ) }>
			{ ! isWPAdminAndNotSimpleSite && <QuerySiteFeatures siteIds={ [ siteId ] } /> }
			<QuerySiteSettings siteId={ siteId } />
			<Page
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ STATS_HEADER_TITLE } /> }
				subTitle={ pageSubTitle }
				actions={ pageActions }
			>
				{ pageTabs }
				{ children }
			</Page>
			{ upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
		</Main>
	);
}
