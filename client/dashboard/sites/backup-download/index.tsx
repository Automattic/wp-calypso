import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	ExternalLink,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { Icon, cloud, chevronLeft, chevronRight } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteBackupDownloadRoute, siteBackupsRoute } from '../../app/router/sites';
import { useFormattedTime } from '../../components/formatted-time';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import SiteBackupDownloadError from './error';
import SiteBackupDownloadForm from './form';
import SiteBackupDownloadProgress from './progress';
import SiteBackupDownloadSuccess from './success';

type DownloadStep = 'form' | 'progress' | 'success' | 'error';

function SiteBackupDownload() {
	const { siteSlug, rewindId } = siteBackupDownloadRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ currentStep, setCurrentStep ] = useState< DownloadStep >( 'form' );
	const [ downloadId, setDownloadId ] = useState< number | null >( null );
	const [ downloadUrl, setDownloadUrl ] = useState< string | null >( null );
	const [ fileSizeBytes, setFileSizeBytes ] = useState< string | undefined >();
	const { createSuccessNotice } = useDispatch( noticesStore );

	const router = useRouter();

	const handleDownloadInitiate = ( newDownloadId: number ) => {
		setCurrentStep( 'progress' );
		setDownloadId( newDownloadId );
	};

	const handleDownloadComplete = ( newDownloadUrl: string, newFileSizeBytes?: string ) => {
		setCurrentStep( 'success' );
		setDownloadUrl( newDownloadUrl );
		setFileSizeBytes( newFileSizeBytes );
		createSuccessNotice( __( 'Backup download file is ready.' ), {
			type: 'snackbar',
		} );
	};

	const handleDownloadError = () => {
		setCurrentStep( 'error' );
	};

	const handleRetry = () => {
		setCurrentStep( 'form' );
		setDownloadId( null );
		setDownloadUrl( null );
		setFileSizeBytes( undefined );
	};

	const downloadPointDate = useFormattedTime(
		new Date( parseFloat( rewindId ) * 1000 ).toISOString(),
		{
			timeStyle: 'short',
		}
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
						site={ site }
						downloadPointDate={ downloadPointDate }
						downloadUrl={ downloadUrl }
						fileSizeBytes={ fileSizeBytes }
					/>
				) : null;
			case 'error':
				return <SiteBackupDownloadError onRetry={ handleRetry } />;
		}
	};

	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( { to: siteBackupsRoute.fullPath, params: { siteSlug } } );
			} }
		>
			{ __( 'Backups' ) }
		</Button>
	);

	return (
		<PageLayout
			size="small"
			header={ <PageHeader prefix={ backButton } title={ __( 'Download backup' ) } /> }
		>
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
								LearnMore: (
									<ExternalLink href="https://jetpack.com/support/backup/">
										{ __( 'Learn more' ) }
									</ExternalLink>
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
		</PageLayout>
	);
}

export default SiteBackupDownload;
