import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import Main from 'calypso/components/main';
import { isLoaded as arePluginsLoaded } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import RequiredPluginsInstallView from './dashboard/required-plugins-install-view';

function WooCommerce() {
	const siteId = useSelector( getSelectedSiteId );
	const areInstalledPluginsLoadedIntoState = useSelector( ( state ) =>
		arePluginsLoaded( state, siteId )
	);

	if ( ! siteId ) {
		return null;
	}

	return (
		<div className="woocommerce">
			<Main class="main" wideLayout>
				<DocumentHead title={ translate( 'WooCommerce' ) } />
				<QuerySiteFeatures siteId={ siteId } />
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				{ areInstalledPluginsLoadedIntoState && <RequiredPluginsInstallView siteId={ siteId } /> }
			</Main>
		</div>
	);
}

export default WooCommerce;
