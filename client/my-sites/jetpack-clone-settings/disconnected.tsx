import { ReactElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default function JetpackCloneSettingsDisconnected(): ReactElement {
	return (
		<Main className="jetpack-clone-settings">
			<DocumentHead title="Jetpack Clone Settings" />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<div className="jetpack-search__disconnected">
				<JetpackDisconnectedWPCOM />
			</div>
		</Main>
	);
}
