import { siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody } from '../../components/card';
import { useFormattedTime } from '../../components/formatted-time';
import SiteBackupDownloadError from './error';
import SiteBackupDownloadForm from './form';
import SiteBackupDownloadProgress from './progress';
import SiteBackupDownloadSuccess from './success';
import type { Site } from '@automattic/api-core';

type DownloadStep = 'form' | 'progress' | 'success' | 'error';

export function BackupDownloadFlow( {
	site,
	rewindId,
	initialDownloadId,
}: {
	site: Site;
	rewindId: string;
	initialDownloadId?: number;
} ) {
	const { data: siteSettings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const gmtOffset = siteSettings.gmt_offset;
	const timezoneString = siteSettings.timezone_string;

	const initialStep: DownloadStep = initialDownloadId ? 'progress' : 'form';

	const [ currentStep, setCurrentStep ] = useState< DownloadStep >( initialStep );
	const [ downloadId, setDownloadId ] = useState< number | null >( initialDownloadId || null );
	const [ downloadUrl, setDownloadUrl ] = useState< string | null >( null );
	const [ fileSizeBytes, setFileSizeBytes ] = useState< string | undefined >();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	const handleDownloadInitiate = ( newDownloadId: number ) => {
		recordTracksEvent( 'calypso_dashboard_backups_download_started' );
		setCurrentStep( 'progress' );
		setDownloadId( newDownloadId );
	};

	const handleDownloadComplete = ( newDownloadUrl: string, newFileSizeBytes?: string ) => {
		recordTracksEvent( 'calypso_dashboard_backups_download_completed' );
		setCurrentStep( 'success' );
		setDownloadUrl( newDownloadUrl );
		setFileSizeBytes( newFileSizeBytes );
		createSuccessNotice( __( 'Backup download file is ready.' ), {
			type: 'snackbar',
		} );
	};

	const handleDownloadError = () => {
		recordTracksEvent( 'calypso_dashboard_backups_download_failed' );
		setCurrentStep( 'error' );
	};

	const handleRetry = () => {
		recordTracksEvent( 'calypso_dashboard_backups_download_retry' );
		setCurrentStep( 'form' );
		setDownloadId( null );
		setDownloadUrl( null );
		setFileSizeBytes( undefined );
	};

	const downloadPointDate = useFormattedTime(
		new Date( parseFloat( rewindId ) * 1000 ).toISOString(),
		{
			dateStyle: 'medium',
			timeStyle: 'short',
		},
		timezoneString,
		gmtOffset
	);

	const renderStep = () => {
		switch ( currentStep ) {
			case 'form':
				return (
					<SiteBackupDownloadForm
						siteId={ site.ID }
						rewindId={ rewindId }
						downloadPointDate={ downloadPointDate }
						onDownloadInitiate={ handleDownloadInitiate }
					/>
				);
			case 'progress':
				return downloadId ? (
					<SiteBackupDownloadProgress
						site={ site }
						downloadId={ downloadId }
						onDownloadComplete={ handleDownloadComplete }
						onDownloadError={ handleDownloadError }
					/>
				) : null;
			case 'success':
				return downloadUrl ? (
					<SiteBackupDownloadSuccess
						downloadPointDate={ downloadPointDate }
						downloadUrl={ downloadUrl }
						fileSizeBytes={ fileSizeBytes }
					/>
				) : null;
			case 'error':
				return <SiteBackupDownloadError onRetry={ handleRetry } />;
		}
	};

	if ( currentStep === 'success' ) {
		return <>{ renderStep() }</>;
	}

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>{ renderStep() }</VStack>
			</CardBody>
		</Card>
	);
}
