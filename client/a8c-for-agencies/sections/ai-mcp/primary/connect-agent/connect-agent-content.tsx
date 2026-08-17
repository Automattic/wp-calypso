import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import McpConnectAgent from 'calypso/dashboard/agency/resources/mcp/connect-agent-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function AiMcpConnectAgentContent() {
	const dispatch = useDispatch();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<VStack spacing={ 6 }>
			<Text size={ 15 }>
				{ __(
					'Get instructions for connecting your external AI assistant to your Automattic for Agencies account via MCP.'
				) }
			</Text>
			<McpConnectAgent recordTracksEvent={ recordTracks } />
		</VStack>
	);
}
