import { ReactElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

export default function JetpackCloneSettingsDisconnected(): ReactElement {
	return (
		<Main className="jetpack-clone-settings">
			<DocumentHead title="Jetpack Clone Settings" />
			<PageViewTracker path="/jetpack-clone-settings/:site" title="Jetpack Clone Settings" />
			<div className="jetpack-clone-settings__disconnected">
				<JetpackDisconnectedWPCOM />
			</div>
		</Main>
	);
}
