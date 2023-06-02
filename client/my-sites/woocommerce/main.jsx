import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import LandingPage from './landing-page';

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
				<LandingPage siteId={ siteId } />
			</Main>
		</div>
	);
}

export default WooCommerce;
