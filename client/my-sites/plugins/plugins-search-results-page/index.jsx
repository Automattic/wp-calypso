import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullWidthSection from 'calypso/components/full-width-section';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import NoResults from 'calypso/my-sites/no-results';
import MarketplaceAIBanner from 'calypso/my-sites/plugins/marketplace-ai-experience/banner';
import BusinessPlanBanner from 'calypso/my-sites/plugins/plugins-banners/business-plan-banner';
import JetpackSeoBanner, {
	isSeoSearch,
} from 'calypso/my-sites/plugins/plugins-banners/jetpack-seo-banner';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { UNLISTED_PLUGINS } from '../constants';
import { useIsMarketplaceRedesignEnabled } from '../hooks/use-is-marketplace-redesign-enabled';
import ClearSearchButton from '../plugins-browser/clear-search-button';
import { PaidPluginsSection } from '../plugins-discovery-page';
import usePlugins from '../use-plugins';

function isNotBlocked( plugin ) {
	return UNLISTED_PLUGINS.indexOf( plugin.slug ) === -1;
}

const PluginsSearchResultPage = ( {
	search: searchTerm,
	siteSlug,
	siteId,
	sites,
	categoryName,
	setIsFetchingPluginsBySearchTerm,
} ) => {
	const {
		plugins: pluginsBySearchTerm = [],
		isFetching: isFetchingPluginsBySearchTerm,
		pagination: pluginsPagination,
		fetchNextPage,
	} = usePlugins( {
		infinite: true,
		search: searchTerm,
	} );

	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const translate = useTranslate();

	const showCompassBanner = isLoggedIn && isEnabled( 'plugins/plugin-compass' );

	// Require both siteId and siteSlug: the banner reads module/plan/admin-url
	// state and activates the module by siteId, so without it those selectors and
	// the activate dispatch would run with a null id.
	const showSeoHint =
		isEnabled( 'plugins/jetpack-seo-hint' ) &&
		!! siteId &&
		!! siteSlug &&
		isSeoSearch( searchTerm );

	// Only read Jetpack module / plan / admin-url state when the SEO hint is
	// actually in play. Otherwise these selectors would run on every plugin
	// search and touch state slices a plain plugins-browser render need not have.
	const isSeoModuleActive = useSelector( ( state ) =>
		showSeoHint && siteId ? isJetpackModuleActive( state, siteId, 'seo-tools' ) : false
	);

	const hasAdvancedSeo = useSelector( ( state ) =>
		showSeoHint && siteId ? siteHasFeature( state, siteId, FEATURE_ADVANCED_SEO ) : false
	);

	const seoAdminUrl = useSelector( ( state ) =>
		showSeoHint ? getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack-seo' ) : null
	);

	/*
	 * Syncs the internal value of is fetching to share it with the search header
	 * This is a temporary solution until phase 4 of the refactor is implemented.
	 */
	useEffect( () => {
		setIsFetchingPluginsBySearchTerm( isFetchingPluginsBySearchTerm );
	}, [ setIsFetchingPluginsBySearchTerm, isFetchingPluginsBySearchTerm ] );

	useEffect( () => {
		if ( searchTerm && pluginsPagination?.page === 1 ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_show', {
					search_term: searchTerm,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}

		if ( searchTerm && pluginsPagination.page ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_page', {
					search_term: searchTerm,
					page: pluginsPagination.page,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}
	}, [ searchTerm, pluginsPagination.page, pluginsPagination.results, dispatch, siteId ] );

	const isMarketplaceRedesign = useIsMarketplaceRedesignEnabled();

	if ( pluginsBySearchTerm.length > 0 || isFetchingPluginsBySearchTerm ) {
		let title = translate( 'Search results for "%(searchTerm)s"', {
			textOnly: true,
			args: { searchTerm },
		} );

		if ( pluginsPagination ) {
			title = translate(
				'Found %(total)s plugin for "%(searchTerm)s"',
				'Found %(total)s plugins for "%(searchTerm)s"',
				{
					count: pluginsPagination.results,
					textOnly: true,
					args: {
						total: pluginsPagination.results.toLocaleString(),
						searchTerm,
					},
				}
			);

			if ( categoryName ) {
				title = translate(
					'Found %(total)s plugin for "%(searchTerm)s" under "%(categoryName)s"',
					'Found %(total)s plugins for "%(searchTerm)s" under "%(categoryName)s"',
					{
						count: pluginsPagination.results,
						textOnly: true,
						args: {
							total: pluginsPagination.results.toLocaleString(),
							searchTerm,
							categoryName,
						},
					}
				);
			}
		}

		return (
			<FullWidthSection
				className="plugins-browser__search-results"
				enabled={ isMarketplaceRedesign }
			>
				<UpgradeNudge siteSlug={ siteSlug } paidPlugins />
				<PluginsBrowserList
					plugins={ pluginsBySearchTerm.filter( isNotBlocked ) }
					listName={ 'plugins-browser-list__search-for_' + searchTerm.replace( /\s/g, '-' ) }
					listType="search"
					title={ translate( 'Search Results' ) }
					subtitle={
						<>
							{ title }
							<ClearSearchButton />
						</>
					}
					afterHeader={
						showSeoHint || showCompassBanner ? (
							<>
								{ showSeoHint && (
									<JetpackSeoBanner
										siteId={ siteId }
										siteSlug={ siteSlug }
										searchTerm={ searchTerm }
										isSeoModuleActive={ isSeoModuleActive }
										hasAdvancedSeo={ hasAdvancedSeo }
										seoAdminUrl={ seoAdminUrl }
										onEnableSeo={ () => dispatch( activateModule( siteId, 'seo-tools' ) ) }
									/>
								) }
								{ showCompassBanner && <MarketplaceAIBanner variant="slim" /> }
							</>
						) : null
					}
					showReset
					site={ siteSlug }
					showPlaceholders={ isFetchingPluginsBySearchTerm }
					currentSites={ sites }
					variant={ PluginsBrowserListVariant.Paginated }
					extended
					search={ searchTerm }
					injectAfterIndex={ isMarketplaceRedesign ? 12 : undefined }
					injectElement={ isMarketplaceRedesign ? <BusinessPlanBanner /> : undefined }
				/>
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			</FullWidthSection>
		);
	}

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<FullWidthSection enabled={ isMarketplaceRedesign }>
			<div className="plugins-browser__no-results">
				<NoResults
					text={ translate( 'No matches found' ) }
					subtitle={ translate(
						'Try using different keywords or check below our must-have premium plugins'
					) }
				/>
				<PaidPluginsSection noHeader />
			</div>
		</FullWidthSection>
	);
};

export default PluginsSearchResultPage;
