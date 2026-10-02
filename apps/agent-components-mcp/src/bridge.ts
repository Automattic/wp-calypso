import {
	ComponentSession,
	validateComponentOpening,
	validateLegacyButtonAction,
} from '@automattic/agent-components';
import type { App } from '@modelcontextprotocol/ext-apps';

type ComponentBridge = Pick< App, 'callServerTool' | 'sendMessage' | 'getHostCapabilities' >;

export function createMcpComponentSession(
	value: unknown,
	bridge: ComponentBridge,
	locale?: string
) {
	const opening = validateComponentOpening( value );
	const result = opening?.result ?? validateLegacyButtonAction( value );
	if ( ! result || ! bridge.getHostCapabilities()?.serverTools ) {
		throw new Error( 'This host cannot display this action.' );
	}
	return new ComponentSession( {
		result,
		...( opening && {
			allowedActions: opening.allowedActions,
			actionBindings: opening.actionBindings,
			expiresAt: opening.expiresAt,
		} ),
		locale,
		transport: async ( request ) => {
			const response = await bridge.callServerTool( {
				name: 'wpcom-component-action',
				arguments: { ...request },
			} );
			if ( response.isError ) {
				throw new Error( 'The MCP action failed.' );
			}
			return response.structuredContent;
		},
		onContinue: async ( summary ) => {
			const response = await bridge.sendMessage( {
				role: 'user',
				content: [ { type: 'text', text: summary } ],
			} );
			if ( response.isError ) {
				throw new Error( 'The host refused continuation.' );
			}
		},
	} );
}
