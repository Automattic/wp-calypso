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

	return <McpConnectAgent recordTracksEvent={ recordTracks } />;
}
