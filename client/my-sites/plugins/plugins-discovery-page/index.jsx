import { useSelector } from 'react-redux';
import HostingActivateStatus from 'calypso/hosting/server-settings/hosting-activate-status';
import { TrialAcknowledgeModal } from 'calypso/my-sites/plans/trials/trial-acknowledge/acknowlege-modal';
import { WithOnclickTrialRequest } from 'calypso/my-sites/plans/trials/trial-acknowledge/with-onclick-trial-request';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { WPBEGINNER_PLUGINS } from '../constants';
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
export const FeaturePartnerBundlePlugins = ( props ) => {
	const { category } = props;

	const { plugins, isFetching } = usePlugins( {
		category,
		infinite: true,
		slugs: WPBEGINNER_PLUGINS,
	} );

	return <SingleListView { ...props } plugins={ plugins } isFetching={ isFetching } />;
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
	const siteId = useSelector( getSelectedSiteId );
	const sitePartnerBundle = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'site_partner_bundle' )
	);
	const isWPBeginnerSpecial = sitePartnerBundle === 'wpbeginner-special';

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

			{ isWPBeginnerSpecial && <FeaturePartnerBundlePlugins { ...props } category="wpbeginner" /> }
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
