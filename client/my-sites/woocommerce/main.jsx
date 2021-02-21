/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RequiredPluginsInstallView from './dashboard/required-plugins-install-view';
import Main from 'calypso/components/main';

export function Woocommerce() {
	return (
		<div className="woocommerce">
			<Main class="main" wideLayout>
				<RequiredPluginsInstallView></RequiredPluginsInstallView>
			</Main>
		</div>
	);
}

export default localize( Woocommerce );
