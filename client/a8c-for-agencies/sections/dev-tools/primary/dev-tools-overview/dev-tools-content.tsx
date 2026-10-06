import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import DevTools from 'calypso/dashboard/agency/resources/dev-tools/dev-tools-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function DevToolsContent() {
	const dispatch = useDispatch();

	const recordTracks = useCallback(
		( eventName: string ) => {
			dispatch( recordTracksEvent( eventName ) );
		},
		[ dispatch ]
	);

	return (
		<VStack spacing={ 6 }>
			<Text size={ 15 }>
				{ __(
					'Build and ship client work faster with local development and automated deploys. Test ideas and demo progress to clients with disposable environments that need no cleanup.'
				) }
			</Text>
			<DevTools recordTracksEvent={ recordTracks } />
		</VStack>
	);
}
