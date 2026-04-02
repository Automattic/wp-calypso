import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main, { MainProps } from 'calypso/components/main';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import StatsUpsellModal from 'calypso/my-sites/stats/stats-upsell-modal';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getUpsellModalView } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STATS_HEADER_TITLE } from '../../constants';

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

	return (
		<span className="stats-breadcrumbs" role="navigation" aria-label={ translate( 'Breadcrumbs' ) }>
			<JetpackLogo size={ 20 } monochrome={ false } />
			{ items.flatMap( ( item, index ) => {
				const elements: ReactNode[] = [];
				if ( index > 0 ) {
					elements.push(
						<span key={ `sep-${ index }` } className="stats-breadcrumbs__separator">
							{ ' / ' }
						</span>
					);
				}
				if ( item.to ) {
					elements.push(
						<a
							key={ `item-${ index }` }
							className="stats-breadcrumbs__link"
							href={ item.to }
							onClick={ ( e ) => {
								e.preventDefault();
								page( item.to! );
							} }
						>
							{ item.label }
						</a>
					);
				} else {
					elements.push(
						<span key={ `item-${ index }` } className="stats-breadcrumbs__current">
							{ item.label }
						</span>
					);
				}
				return elements;
			} ) }
		</span>
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

	const defaultTitle = <JetpackTitle title={ STATS_HEADER_TITLE } />;

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme, className ) }>
			{ ! isWPAdminAndNotSimpleSite && <QuerySiteFeatures siteIds={ [ siteId ] } /> }
			<QuerySiteSettings siteId={ siteId } />
			<Page
				showSidebarToggle={ false }
				title={ breadcrumbs ? <StatsBreadcrumbs items={ breadcrumbs } /> : defaultTitle }
				subTitle={ breadcrumbs ? undefined : pageSubTitle }
				actions={ pageActions }
			>
				{ pageTabs }
				{ children }
			</Page>
			{ upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
		</Main>
	);
}
