import { useRouter } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { siteBackupDownloadRoute, siteBackupsRoute } from '../../app/router/sites';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SiteBackupDownload() {
	const { siteSlug, rewindId } = siteBackupDownloadRoute.useParams();
	const router = useRouter();

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
				<CardBody>
					<VStack spacing={ 4 }>
						<p>Rewind ID: { rewindId }</p>
						<Notice variant="info" title={ __( 'Download Information' ) }>
							{ __(
								'This backup contains all your site files, database, and settings from the selected restore point. The download will be prepared and made available for download.'
							) }
						</Notice>
						<HStack justify="flex-start">
							<Button variant="primary" type="submit">
								{ __( 'Generate download' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default SiteBackupDownload;
