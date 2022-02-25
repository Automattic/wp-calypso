import { ReactElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default function JetpackSearchDisconnected(): ReactElement {
	const isCloud = isJetpackCloud();
	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			{ isCloud && <SidebarNavigation /> }
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<div className="jetpack-search__disconnected">
				{ isCloud ? <JetpackDisconnected /> : <JetpackDisconnectedWPCOM /> }
			</div>
		</Main>
	);
}
