import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	CardHeader,
	ExternalLink,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement, useState, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, cloud } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteBackupDownloadRoute } from '../../app/router/sites';
import { useFormattedTime } from '../../components/formatted-time';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
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
					<CardHeader>
						<SectionHeader
							title={ __( 'Download point' ) }
							level={ 3 }
							description={ createInterpolateElement(
								/* translators: %s is the date of the download point */
								sprintf( __( '%(downloadPointDate)s. <LearnMore />' ), {
									downloadPointDate,
								} ),
								{
									LearnMore: isSelfHostedJetpackConnected( site ) ? (
										<ExternalLink href={ localizeUrl( 'https://jetpack.com/support/backup/' ) }>
											{ __( 'Learn more' ) }
										</ExternalLink>
									) : (
										<InlineSupportLink supportContext="backups">
											{ __( 'Learn more' ) }
										</InlineSupportLink>
									),
								}
							) }
							decoration={ <Icon icon={ cloud } /> }
						/>
					</CardHeader>
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
