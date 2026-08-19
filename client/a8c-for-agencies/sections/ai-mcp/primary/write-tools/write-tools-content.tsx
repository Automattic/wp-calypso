import { useCallback } from 'react';
import useFetchMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-fetch-mcp-settings';
import useSaveMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-save-mcp-settings';
import McpTools from 'calypso/dashboard/agency/resources/mcp/tools-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { McpSettingsUpdate } from 'calypso/a8c-for-agencies/data/mcp-ai/types';

export default function AiMcpWriteToolsContent() {
	const dispatch = useDispatch();
	const { data: settings } = useFetchMcpSettings();
	const saveSettings = useSaveMcpSettings();
	const { isPending: isSaving } = saveSettings;

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
		<McpTools
			toolType="write"
			settings={ settings }
			isSaving={ isSaving }
			onSave={ onSave }
			recordTracksEvent={ recordTracks }
		/>
	);
}
