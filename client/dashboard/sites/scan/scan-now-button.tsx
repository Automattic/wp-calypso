import { siteScanEnqueueMutation, siteScanQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useScanState } from './use-scan-state';
import type { Site } from '@automattic/api-core';

interface ScanNowButtonProps {
	site: Site;
}

export function ScanNowButton( { site }: ScanNowButtonProps ) {
	const { recordTracksEvent } = useAnalytics();

	const [ isEnqueued, setIsEnqueued ] = useState( false );
	const { status } = useScanState( site.ID );
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

	// Reset enqueued state when scan actually starts
	useEffect( () => {
		if ( isRunning && isEnqueued ) {
			setIsEnqueued( false );
		}
	}, [ status, isEnqueued, isRunning ] );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_scan_scan_now' );
		triggerScan();
	};

	const getButtonContent = () => {
		if ( isEnqueued ) {
			return {
				label: __( 'Scan enqueued' ),
				tooltip: __( 'A scan has been queued and will start shortly.' ),
			};
		}

		if ( status === 'running' ) {
			return {
				label: __( 'Scan in progress' ),
				tooltip: __( 'A scan is currently in progress.' ),
			};
		}

		return {
			label: __( 'Scan now' ),
			tooltip: __( 'Trigger a scan of your site now.' ),
		};
	};

	const isBusy = isRunning || isPending || isEnqueued;

	return (
		<Button
			variant="secondary"
			onClick={ handleClick }
			disabled={ isBusy }
			isBusy={ isBusy }
			accessibleWhenDisabled
			description={ getButtonContent().tooltip }
			label={ getButtonContent().label }
			showTooltip
		>
			{ getButtonContent().label }
		</Button>
	);
}
