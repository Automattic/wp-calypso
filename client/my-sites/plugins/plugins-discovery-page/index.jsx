import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import FullWidthSection from 'calypso/components/full-width-section';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { WPBEGINNER_PLUGINS } from '../constants';
import EducationFooter from '../education-footer';
import BusinessPlanBanner from '../plugins-banners/business-plan-banner';
import TelexBanner from '../plugins-banners/telex-banner';
import CollectionListView from '../plugins-browser/collection-list-view';
import SingleListView, { SHORT_LIST_LENGTH } from '../plugins-browser/single-list-view';
import usePlugins from '../use-plugins';
import InPageCTASection from './in-page-cta-section';
import UpgradeNudge from './upgrade-nudge';

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

	return (
		<>
			<FullWidthSection className="plugins-discovery-page__hero">
				<UpgradeNudge { ...props } paidPlugins />
				{ isWPBeginnerSpecial && (
					<FeaturePartnerBundlePlugins { ...props } category="wpbeginner" />
				) }
				<PaidPluginsSection { ...props } />
			</FullWidthSection>

			<FullWidthSection className="plugins-discovery-page__do-more full-width-section--gray">
				<CollectionListView category="monetization" { ...props } />
			</FullWidthSection>

			<FullWidthSection className="plugins-discovery-page__education-footer">
				<EducationFooter />
			</FullWidthSection>

			{ ! isLoggedIn && ! isEnabled( 'marketplace-redesign' ) && <InPageCTASection /> }

			{ isEnabled( 'marketplace-redesign' ) && (
				<FullWidthSection className="plugins-discovery-page__telex-banner full-width-section--double-padding">
					<TelexBanner />
				</FullWidthSection>
			) }

			<FullWidthSection className="plugins-discovery-page__favorites full-width-section--double-padding full-width-section--gray">
				<FeaturedPluginsSection
					{ ...props }
					pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
					isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
				/>
			</FullWidthSection>

			<FullWidthSection className="plugins-discovery-page__business">
				<CollectionListView category="business" { ...props } />
			</FullWidthSection>

			{ isEnabled( 'marketplace-redesign' ) && (
				<FullWidthSection className="plugins-discovery-page__business-plan-banner">
					<BusinessPlanBanner />
				</FullWidthSection>
			) }

			<FullWidthSection className="plugins-discovery-page__free-essentials full-width-section--double-padding">
				<PopularPluginsSection
					{ ...props }
					pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				/>
			</FullWidthSection>

			<FullWidthSection className="plugins-discovery-page__power-store full-width-section--gray">
				<CollectionListView category="ecommerce" { ...props } />
			</FullWidthSection>
		</>
	);
};

export default PluginsDiscoveryPage;
