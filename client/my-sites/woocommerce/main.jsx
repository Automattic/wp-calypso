/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import RequiredPluginsInstallView from './dashboard/required-plugins-install-view';
import WooCommerceColophon from './woocommerce-colophon';
import Main from 'calypso/components/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isLoaded as arePluginsLoaded } from 'calypso/state/plugins/installed/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';

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
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				{ areInstalledPluginsLoadedIntoState && <RequiredPluginsInstallView /> }
			</Main>
			<WooCommerceColophon />
		</div>
	);
}

export default WooCommerce;
