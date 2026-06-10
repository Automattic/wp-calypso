import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteBackupDownloadRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { useFormattedTime } from '../../components/formatted-time';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SiteBackupDownloadError from './error';
import SiteBackupDownloadForm from './form';
import SiteBackupDownloadProgress from './progress';
import SiteBackupDownloadSuccess from './success';

type DownloadStep = 'form' | 'progress' | 'success' | 'error';

function SiteBackupDownload() {
	const { siteSlug, rewindId } = siteBackupDownloadRoute.useParams();
	const { downloadId: searchDownloadId } = siteBackupDownloadRoute.useSearch();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = siteSettings;

	// Initialize step based on whether downloadId is provided in search params
	const initialStep: DownloadStep = searchDownloadId ? 'progress' : 'form';

	const [ currentStep, setCurrentStep ] = useState< DownloadStep >( initialStep );
	const [ downloadId, setDownloadId ] = useState< number | null >( searchDownloadId || null );
	const [ downloadUrl, setDownloadUrl ] = useState< string | null >( null );
	const [ fileSizeBytes, setFileSizeBytes ] = useState< string | undefined >();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	const router = useRouter();

	// Clean up the downloadId query param once we've captured it
	useEffect( () => {
		if ( searchDownloadId ) {
			router.navigate( {
				to: siteBackupDownloadRoute.fullPath,
				params: { siteSlug, rewindId },
				search: {},
				replace: true,
			} );
		}
	}, [ router, siteSlug, rewindId, searchDownloadId ] );

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

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Download backup' ) } />
			}
		>
			{ currentStep !== 'success' ? (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>{ renderStep() }</VStack>
					</CardBody>
				</Card>
			) : (
				renderStep()
			) }
		</PageLayout>
	);
}

export default SiteBackupDownload;
