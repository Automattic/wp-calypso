/**
 * External dependencies
 */
import React, { ReactElement } from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default function JetpackSearchDisconnected(): ReactElement {
	const isCloud = isJetpackCloud();
	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<div className="jetpack-search__disconnected">
				{ isCloud ? <JetpackDisconnected /> : <JetpackDisconnectedWPCOM /> }
			</div>
		</Main>
	);
}
