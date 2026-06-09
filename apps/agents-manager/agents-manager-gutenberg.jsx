import './config';
import { registerPlugin } from '@wordpress/plugins';
import AgentsManagerWithProvider from './agents-manager-with-provider';
import { shouldSuppressJetpackAiSidebarPreview } from './jetpack-ai-sidebar-preview-gate';

registerPlugin( 'jetpack-agents-manager', {
	render: () => ( shouldSuppressJetpackAiSidebarPreview() ? null : <AgentsManagerWithProvider /> ),
} );
