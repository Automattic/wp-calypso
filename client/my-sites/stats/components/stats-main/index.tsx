import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { MouseEvent, ReactNode } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main, { MainProps } from 'calypso/components/main';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import StatsUpsellModal from 'calypso/my-sites/stats/stats-upsell-modal';
import { useSelector } from 'calypso/state';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getUpsellModalView } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STATS_HEADER_TITLE } from '../../constants';
import type { JetpackFooterMenuItem } from 'calypso/components/jetpack/jetpack-footer';

export interface BreadcrumbItem {
	label: string;
	to?: string;
}

interface StatsMainProps extends MainProps {
	/** Subtitle shown below the page title in the unified header. */
	pageSubTitle?: ReactNode;
	/** Optional actions to display on the right side of the unified header. */
	pageActions?: ReactNode;
	/** Navigation tabs rendered as the first child inside the Page content area. */
	pageTabs?: ReactNode;
	/** Breadcrumb items. When provided, replaces the default title with a breadcrumb trail. */
	breadcrumbs?: BreadcrumbItem[];
}

function StatsBreadcrumbs( { items }: { items: BreadcrumbItem[] } ) {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	// First item is always "Stats" with the Jetpack logo, linking to the first item's URL.
	// Fall back to the top-level Stats page so the root renders as a working link from the
	// first frame, before the breadcrumb-trail effect has populated the items.
	const rootUrl = items[ 0 ]?.to ?? ( siteSlug ? `/stats/day/${ siteSlug }` : undefined );
	const restItems = items.slice( 1 );

	// Route unmodified primary-button clicks through the SPA router while leaving
	// modified clicks (Cmd/Ctrl/middle-click, etc.) to open in a new tab natively.
	const handleClick = ( e: MouseEvent, to: string ) => {
		if (
			e.defaultPrevented ||
			e.button !== 0 ||
			e.metaKey ||
			e.altKey ||
			e.ctrlKey ||
			e.shiftKey
		) {
			return;
		}
		e.preventDefault();
		page( to );
	};

	return (
		<nav className="stats-breadcrumbs" aria-label={ translate( 'Breadcrumbs' ) }>
			{ rootUrl ? (
				<a
					className="stats-breadcrumbs__link"
					href={ rootUrl }
					onClick={ ( e ) => handleClick( e, rootUrl ) }
				>
					{ STATS_HEADER_TITLE }
				</a>
			) : (
				<span className="stats-breadcrumbs__current">{ STATS_HEADER_TITLE }</span>
			) }
			{ restItems.map( ( item, index ) => (
				<span key={ index }>
					<span className="stats-breadcrumbs__separator"> / </span>
					{ item.to ? (
						<a
							key={ `item-${ index }` }
							className="stats-breadcrumbs__link"
							href={ item.to }
							onClick={ ( e ) => handleClick( e, item.to! ) }
						>
							{ item.label }
						</a>
					) : (
						<span className="stats-breadcrumbs__current">{ item.label }</span>
					) }
				</span>
			) ) }
		</nav>
	);
}

export default function StatsMain( {
	children,
	className,
	pageSubTitle,
	pageActions,
	pageTabs,
	breadcrumbs,
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

	const translate = useTranslate();
	const footerMenu: JetpackFooterMenuItem[] = isWPAdminAndNotSimpleSite
		? [
				{
					label: translate( 'Products' ),
					href: 'admin.php?page=my-jetpack#/products',
				},
				{
					label: translate( 'Help' ),
					href: 'admin.php?page=my-jetpack#/help',
				},
		  ]
		: [];

	const titleContent = breadcrumbs ? (
		<StatsBreadcrumbs items={ breadcrumbs } />
	) : (
		STATS_HEADER_TITLE
	);

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme, className ) }>
			{ ! isWPAdminAndNotSimpleSite && <QuerySiteFeatures siteIds={ [ siteId ] } /> }
			<QuerySiteSettings siteId={ siteId } />
			<Page
				// Restore a stable styling hook lost when @wordpress/admin-ui 2.x moved Page
				// internals to CSS Modules. Stats SCSS overrides target `.admin-ui-page`.
				className="admin-ui-page"
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ titleContent } /> }
				subTitle={ breadcrumbs ? undefined : pageSubTitle }
				actions={ pageActions }
			>
				{ pageTabs }
				{ children }
			</Page>
			<JetpackFooter menu={ footerMenu } />
			{ upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
		</Main>
	);
}
