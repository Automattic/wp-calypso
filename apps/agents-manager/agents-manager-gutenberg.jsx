import './config';
import { isEmbeddedInFullscreen } from '@automattic/agents-manager/src/utils/embedded-page-protocol';
import { registerPlugin } from '@wordpress/plugins';
import AgentsManagerWithProvider from './agents-manager-with-provider';
import { shouldSuppressJetpackAiSidebarPreview } from './jetpack-ai-sidebar-preview-gate';

const shouldSuppressAgentsManager = shouldSuppressJetpackAiSidebarPreview();

registerPlugin( 'jetpack-agents-manager', {
	render: () =>
		shouldSuppressAgentsManager && ! isEmbeddedInFullscreen() ? null : (
			<AgentsManagerWithProvider />
		),
} );
