import { FEATURE_WOOP } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Main from 'calypso/components/main';
import { isLoaded as arePluginsLoaded } from 'calypso/state/plugins/installed/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import hasAvailableSiteFeature from 'calypso/state/selectors/has-available-site-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import RequiredPluginsInstallView from './dashboard/required-plugins-install-view';

function WooCommerce() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const areInstalledPluginsLoadedIntoState = useSelector( ( state ) =>
		arePluginsLoaded( state, siteId )
	);

	const isWoopFeatureActive = useSelector( ( state ) =>
		hasActiveSiteFeature( state, siteId, FEATURE_WOOP )
	);

	const hasWoopFeatureAvailable = useSelector( ( state ) =>
		hasAvailableSiteFeature( state, siteId, FEATURE_WOOP )
	);

	const upgradingPlan =
		useSelector( ( state ) => getProductBySlug( state, hasWoopFeatureAvailable?.[ 0 ] ) ) || {};

	if ( ! siteId ) {
		return null;
	}

	return (
		<div className="woocommerce">
			<Main class="main" wideLayout>
				<DocumentHead title={ translate( 'WooCommerce' ) } />
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				{ areInstalledPluginsLoadedIntoState && (
					<RequiredPluginsInstallView
						siteId={ siteId }
						siteSlug={ siteSlug }
						isFeatureActive={ isWoopFeatureActive }
						upgradingPlan={ upgradingPlan }
					/>
				) }
			</Main>
		</div>
	);
}

export default WooCommerce;
