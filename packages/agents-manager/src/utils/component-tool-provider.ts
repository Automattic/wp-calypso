import { getValidatedComponentOpening } from './component-results';
import type { ToolProvider } from '@automattic/agenttic-client';

export const componentHandoffProvider: ToolProvider = {
	getDispatchableTools: async () =>
		[ 'wpcom/render-components', 'wpcom__render_components' ].map( ( id ) => ( {
			id,
			name: 'Render components',
			description: 'Display an authenticated action proposal.',
			input_schema: { type: 'object', properties: {} },
		} ) ),
	executeTool: async ( toolId, args ) => {
		if ( ! [ 'wpcom/render-components', 'wpcom__render_components' ].includes( toolId ) ) {
			throw new Error( 'This component is unavailable.' );
		}
		const validation = await import( '@automattic/agent-components/validation' );
		const result = getValidatedComponentOpening( args, validation )?.result;
		return {
			returnToAgent: false,
			result: {
				success: false,
				message:
					result?.status === 'awaiting-input' && result.revision === 1
						? 'An action is awaiting user confirmation.'
						: 'This action is unavailable.',
			},
		};
	},
};
