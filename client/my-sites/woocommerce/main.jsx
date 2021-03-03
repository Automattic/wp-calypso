/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import RequiredPluginsInstallView from './dashboard/required-plugins-install-view';
import WooCommerceColophon from './woocommerce-colophon';
import Main from 'calypso/components/main';

function WooCommerce() {
	return (
		<div className="woocommerce">
			<Main class="main" wideLayout>
				<RequiredPluginsInstallView />
			</Main>
			<WooCommerceColophon />
		</div>
	);
}

export default WooCommerce;
