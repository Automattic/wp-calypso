import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import WoopLandingPage from './landing-page';

function WooCommerce() {
	const siteId = useSelector( getSelectedSiteId );

	if ( ! siteId ) {
		return null;
	}

	return (
		<div className="woocommerce">
			<Main class="main" wideLayout>
				<DocumentHead title={ translate( 'WooCommerce' ) } />
				<PageViewTracker path="/woocommerce-installation/:site" title="WooCommerce Installation" />
				<QuerySiteFeatures siteId={ siteId } />
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				<WoopLandingPage siteId={ siteId } />
			</Main>
		</div>
	);
}

export default WooCommerce;
