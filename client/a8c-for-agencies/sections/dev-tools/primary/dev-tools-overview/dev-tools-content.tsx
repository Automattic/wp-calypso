import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import CertificationDevToolsSection from 'calypso/dashboard/agency/certification/dev-tools-section';
import DevTools from 'calypso/dashboard/agency/resources/dev-tools/dev-tools-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';

export default function DevToolsContent() {
	const dispatch = useDispatch();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const onCodeCopy = useCallback( () => {
		dispatch( successNotice( __( 'Discount code copied to clipboard.' ) ) );
	}, [ dispatch ] );

	return (
		<VStack spacing={ 6 }>
			<Text size={ 15 }>
				{ __(
					'Build and ship client work faster with local development and automated deploys. Test ideas and demo progress to clients with disposable environments that need no cleanup.'
				) }
			</Text>
			<CertificationDevToolsSection
				tiersHref={ `${ A4A_AGENCY_TIER_LINK }#certification` }
				onCodeCopy={ onCodeCopy }
				recordTracksEvent={ recordTracks }
			/>
			<DevTools recordTracksEvent={ recordTracks } />
		</VStack>
	);
}
