import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import McpStarterPrompts from 'calypso/dashboard/agency/resources/mcp/starter-prompts-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function AiMcpStarterPromptsContent() {
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
					'Copy a prompt into your connected assistant to get going. Edit freely — these are starting points, not scripts.'
				) }
			</Text>
			<McpStarterPrompts recordTracksEvent={ recordTracks } />
		</VStack>
	);
}
