import { siteScanEnqueueMutation, siteScanQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { ScanState } from './use-scan-state';
import type { Site } from '@automattic/api-core';

interface ScanNowButtonProps {
	site: Site;
	scanState: ScanState;
}

export function ScanNowButton( { site, scanState }: ScanNowButtonProps ) {
	const { recordTracksEvent } = useAnalytics();

	const { status, setIsEnqueued } = scanState;
	const isEnqueued = status === 'enqueued';
	const isRunning = status === 'running';

	// Enqueue a new scan
	const { mutate: triggerScan, isPending } = useMutation( {
		...siteScanEnqueueMutation( site.ID ),
		onMutate: () => {
			setIsEnqueued( true );
		},
	} );

	// Lets fetch scans if we just enqueued a scan or if there's a scan running
	useQuery( {
		...siteScanQuery( site.ID ),
		refetchInterval: isRunning || isEnqueued ? 2000 : false,
	} );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_scan_scan_now' );
		triggerScan();
	};

	const isDisabled = isRunning || isPending || isEnqueued;

	return (
		<Button variant="secondary" onClick={ handleClick } disabled={ isDisabled }>
			{ __( 'Scan now' ) }
		</Button>
	);
}
