import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import HostingActivateStatus from 'calypso/hosting/server-settings/hosting-activate-status';
import { getQueryArgs } from 'calypso/lib/query-args';
import { TrialAcknowledgeModal } from 'calypso/my-sites/plans/trials/trial-acknowledge/acknowlege-modal';
import { WithOnclickTrialRequest } from 'calypso/my-sites/plans/trials/trial-acknowledge/with-onclick-trial-request';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import EducationFooter from '../education-footer';
import CollectionListView from '../plugins-browser/collection-list-view';
import SingleListView, { SHORT_LIST_LENGTH } from '../plugins-browser/single-list-view';
import usePlugins from '../use-plugins';
import InPageCTASection from './in-page-cta-section';
import UpgradeNudge from './upgrade-nudge';
import { useTrialHelpers } from './use-trial-helpers';
import './style.scss';
/**
 * Module variables
 */

function filterPopularPlugins( popularPlugins = [], featuredPlugins = [] ) {
	const displayedFeaturedSlugsMap = new Map(
		featuredPlugins
			.slice( 0, SHORT_LIST_LENGTH ) // only displayed plugins
			.map( ( plugin ) => [ plugin.slug, plugin.slug ] )
	);

	return popularPlugins.filter(
		( plugin ) =>
			! displayedFeaturedSlugsMap.has( plugin.slug ) && isCompatiblePlugin( plugin.slug )
	);
}

export const PaidPluginsSection = ( props ) => {
	const { plugins: paidPlugins = [], isFetching: isFetchingPaidPlugins } = usePlugins( {
		category: 'paid',
	} );

	if ( props.jetpackNonAtomic ) {
		return null;
	}

	return (
		<SingleListView
			{ ...props }
			category="paid"
			plugins={ paidPlugins }
			isFetching={ isFetchingPaidPlugins }
		/>
	);
};
export const FeaturedDeveloperSection = ( props ) => {
	const { plugins: plugins = [], isFetching: isFetchingPaidPlugins } = usePlugins( {
		search: props.searchTerm,
	} );
	const translate = useTranslate();

	if ( props.jetpackNonAtomic ) {
		return null;
	}

	return (
		<SingleListView
			{ ...props }
			category={ null }
			title={ translate( 'Must-have plugins from WPBeginner' ) }
			subtitle={ translate( 'Add the best-loved plugins on WordPress.com' ) }
			plugins={ plugins }
			isFetching={ isFetchingPaidPlugins }
		/>
	);
};

const FeaturedPluginsSection = ( props ) => {
	return (
		<SingleListView
			{ ...props }
			plugins={ props.pluginsByCategoryFeatured }
			isFetching={ props.isFetchingPluginsByCategoryFeatured }
			category="featured"
		/>
	);
};

const PopularPluginsSection = ( props ) => {
	const { plugins: popularPlugins = [], isFetching: isFetchingPluginsByCategoryPopular } =
		usePlugins( {
			category: 'popular',
		} );

	const pluginsByCategoryPopular = filterPopularPlugins(
		popularPlugins,
		props.pluginsByCategoryFeatured
	);

	return (
		<SingleListView
			{ ...props }
			category="popular"
			plugins={ pluginsByCategoryPopular }
			isFetching={ isFetchingPluginsByCategoryPopular }
		/>
	);
};

const PluginsDiscoveryPage = ( props ) => {
	const {
		plugins: pluginsByCategoryFeatured = [],
		isFetching: isFetchingPluginsByCategoryFeatured,
	} = usePlugins( {
		category: 'featured',
	} );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAwesomeMotive = getQueryArgs()?.ref === 'awesome-motive-lp';

	const {
		isTrialAcknowledgeModalOpen,
		isTransferring,
		hasRequestedTrial,
		trialRequested,
		requestUpdatedSiteData,
		setOpenModal,
		isEligibleForHostingTrial,
		isAtomic,
	} = useTrialHelpers( props );

	return (
		<>
			{ ! isTransferring && ! hasRequestedTrial && <UpgradeNudge { ...props } paidPlugins /> }
			{ ! isTrialAcknowledgeModalOpen && ! isAtomic && (
				<HostingActivateStatus
					context="plugin"
					onTick={ requestUpdatedSiteData }
					keepAlive={ hasRequestedTrial && ! isAtomic }
				/>
			) }

			{ isAwesomeMotive && (
				<FeaturedDeveloperSection { ...props } searchTerm="developer: Awesome Motive" />
			) }
			<PaidPluginsSection { ...props } />
			<CollectionListView category="monetization" { ...props } />
			<EducationFooter />
			{ ! isLoggedIn && <InPageCTASection /> }
			<FeaturedPluginsSection
				{ ...props }
				pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
			/>
			<CollectionListView category="business" { ...props } />
			<PopularPluginsSection { ...props } pluginsByCategoryFeatured={ pluginsByCategoryFeatured } />
			<CollectionListView category="ecommerce" { ...props } />
			{ isEligibleForHostingTrial && isTrialAcknowledgeModalOpen && (
				<TrialAcknowledgeModal setOpenModal={ setOpenModal } trialRequested={ trialRequested } />
			) }
		</>
	);
};

export default WithOnclickTrialRequest( PluginsDiscoveryPage );
