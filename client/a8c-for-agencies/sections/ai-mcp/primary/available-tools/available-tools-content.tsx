import { useCallback } from 'react';
import useFetchMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-fetch-mcp-settings';
import useSaveMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-save-mcp-settings';
import McpAvailableTools from 'calypso/dashboard/agency/resources/mcp/available-tools-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { McpSettingsUpdate } from 'calypso/a8c-for-agencies/data/mcp-ai/types';

export default function AiMcpAvailableToolsContent() {
	const dispatch = useDispatch();
	const { data: settings } = useFetchMcpSettings();
	const saveSettings = useSaveMcpSettings();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const onSave = useCallback(
		( update: McpSettingsUpdate ) => saveSettings.mutate( update ),
		[ saveSettings ]
	);

	return (
		<McpAvailableTools settings={ settings } onSave={ onSave } recordTracksEvent={ recordTracks } />
	);
}
