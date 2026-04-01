import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
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
	pageSubTitle?: ReactNode;
	/** Optional actions to display on the right side of the unified header. */
	pageActions?: ReactNode;
	/** Navigation tabs rendered as the first child inside the Page content area. */
	pageTabs?: ReactNode;
	/** Back URL for detail pages. When set, renders a breadcrumb-style title: Stats / pageSubTitle. */
	pageBackUrl?: string;
}

export default function StatsMain( {
	children,
	className,
	pageSubTitle,
	pageActions,
	pageTabs,
	pageBackUrl,
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

	// Detail pages: breadcrumb-style title with back link.
	// Top-level pages: plain Jetpack + Stats title.
	let title: ReactNode = <JetpackTitle title={ STATS_HEADER_TITLE } />;
	let subTitle = pageSubTitle;

	if ( pageBackUrl ) {
		title = (
			<span className="stats-main__breadcrumb-title">
				<a
					className="stats-main__breadcrumb-link"
					href={ pageBackUrl }
					onClick={ ( e ) => {
						e.preventDefault();
						page( pageBackUrl );
					} }
				>
					<JetpackTitle title={ STATS_HEADER_TITLE } />
				</a>
				{ pageSubTitle && (
					<>
						<span className="stats-main__breadcrumb-separator"> / </span>
						<span className="stats-main__breadcrumb-current">{ pageSubTitle }</span>
					</>
				) }
			</span>
		);
		subTitle = undefined;
	}

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme, className ) }>
			{ ! isWPAdminAndNotSimpleSite && <QuerySiteFeatures siteIds={ [ siteId ] } /> }
			<QuerySiteSettings siteId={ siteId } />
			<Page
				showSidebarToggle={ false }
				title={ title }
				subTitle={ subTitle }
				actions={ pageActions }
			>
				{ pageTabs }
				{ children }
			</Page>
			{ upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
		</Main>
	);
}
