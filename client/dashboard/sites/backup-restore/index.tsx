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
import { createInterpolateElement, useState } from '@wordpress/element';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { Icon, cloud, chevronLeft, chevronRight } from '@wordpress/icons';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteBackupRestoreRoute, siteBackupsRoute } from '../../app/router/sites';
import { useFormattedTime } from '../../components/formatted-time';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import SiteBackupRestoreError from './error';
import SiteBackupRestoreForm from './form';
import SiteBackupRestoreProgress from './progress';
import SiteBackupRestoreSuccess from './success';

type RestoreStep = 'form' | 'progress' | 'success' | 'error';

function SiteBackupRestore() {
	const { siteSlug, rewindId } = siteBackupRestoreRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ currentStep, setCurrentStep ] = useState< RestoreStep >( 'form' );
	const [ restoreId, setRestoreId ] = useState< number | null >( null );

	const router = useRouter();

	const handleRestoreInitiate = ( newRestoreId: number ) => {
		setCurrentStep( 'progress' );
		setRestoreId( newRestoreId );
	};

	const handleRestoreComplete = () => {
		setCurrentStep( 'success' );
	};

	const handleRestoreError = () => {
		setCurrentStep( 'error' );
	};

	const handleRetry = () => {
		setCurrentStep( 'form' );
		setRestoreId( null );
	};

	const restorePointDate = useFormattedTime(
		new Date( parseFloat( rewindId ) * 1000 ).toISOString(),
		{
			dateStyle: 'medium',
			timeStyle: 'short',
		}
	);

	const renderStep = () => {
		switch ( currentStep ) {
			case 'form':
				return (
					<SiteBackupRestoreForm siteId={ site.ID } onRestoreInitiate={ handleRestoreInitiate } />
				);
			case 'progress':
				return restoreId ? (
					<SiteBackupRestoreProgress
						site={ site }
						restoreId={ restoreId }
						onRestoreComplete={ handleRestoreComplete }
						onRestoreError={ handleRestoreError }
					/>
				) : null;
			case 'success':
				return <SiteBackupRestoreSuccess site={ site } restorePointDate={ restorePointDate } />;
			case 'error':
				return <SiteBackupRestoreError onRetry={ handleRetry } />;
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
			header={ <PageHeader prefix={ backButton } title={ __( 'Restore your site' ) } /> }
		>
			<Card>
				<CardHeader>
					<SectionHeader
						title={ __( 'Restore point' ) }
						level={ 3 }
						description={ createInterpolateElement(
							/* translators: %s is the date of the restore point */
							sprintf( __( '%(restorePointDate)s. <LearnMore />' ), {
								restorePointDate,
							} ),
							{
								LearnMore: (
									<ExternalLink href="https://jetpack.com/support/backup/restoring-with-jetpack-backup/">
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

export default SiteBackupRestore;
