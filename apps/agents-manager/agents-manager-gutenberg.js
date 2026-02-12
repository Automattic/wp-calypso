import { registerPlugin } from '@wordpress/plugins';
import AgentsManagerWithProvider from './agents-manager-with-provider';

registerPlugin( 'jetpack-agents-manager', {
	render: () => <AgentsManagerWithProvider />,
} );
