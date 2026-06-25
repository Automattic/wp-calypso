import { useCallback } from 'react';
import {
	A4A_AI_MCP_AVAILABLE_TOOLS_LINK,
	A4A_AI_MCP_CONNECT_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-fetch-mcp-settings';
import useSaveMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-save-mcp-settings';
import McpOverview from 'calypso/dashboard/agency/resources/mcp/overview-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { McpSettingsUpdate } from 'calypso/a8c-for-agencies/data/mcp-ai/types';

export default function AiMcpOverviewContent() {
	const dispatch = useDispatch();
	const { data: settings, isLoading } = useFetchMcpSettings();
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
		<McpOverview
			settings={ settings }
			isLoading={ isLoading }
			isSaving={ saveSettings.isPending }
			onSave={ onSave }
			recordTracksEvent={ recordTracks }
			toolsPath={ A4A_AI_MCP_AVAILABLE_TOOLS_LINK }
			connectPath={ A4A_AI_MCP_CONNECT_LINK }
		/>
	);
}
