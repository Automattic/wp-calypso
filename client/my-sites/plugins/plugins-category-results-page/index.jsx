import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSitePlan, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import FullListView from '../plugins-browser/full-list-view';
import { UpgradeNudge } from '../plugins-discovery-page';
import usePlugins from '../use-plugins';
import Header from './header';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites } ) => {
	const { plugins, isFetching, fetchNextPage, pagination } = usePlugins( {
		category,
		infinite: true,
	} );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || category;
	const categoryDescription = categories[ category ]?.categoryDescription;
	const translate = useTranslate();

	let title = '';
	if ( categoryName && pagination ) {
		title = translate( '%(total)s plugin', '%(total)s plugins', {
			count: pagination.results,
			textOnly: true,
			args: {
				total: pagination.results,
			},
		} );
	}

	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );
	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);
	const isVip = useSelector( ( state ) => isVipSite( state, selectedSite?.ID ) );

	return (
		<>
			<UpgradeNudge
				siteSlug={ siteSlug }
				jetpackNonAtomic={ jetpackNonAtomic }
				selectedSite={ selectedSite }
				sitePlan={ sitePlan }
				isVip={ isVip }
				sites={ sites }
				paidPlugins={ true }
			/>
			<Header title={ categoryName } count={ title } subtitle={ categoryDescription } />

			<FullListView
				plugins={ plugins }
				listName={ category }
				site={ siteSlug }
				showPlaceholders={ isFetching }
				sites={ sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				fetchNextPage={ fetchNextPage }
				extended
			/>
		</>
	);
};

export default PluginsCategoryResultsPage;
