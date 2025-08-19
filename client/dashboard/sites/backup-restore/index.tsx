import { useRouter } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, rotateLeft } from '@wordpress/icons';
import { siteBackupRestoreRoute, siteBackupsRoute } from '../../app/router/sites';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SiteBackupRestore() {
	const { siteSlug, rewindId } = siteBackupRestoreRoute.useParams();
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
			header={ <PageHeader prefix={ backButton } title={ __( 'Restore your site' ) } /> }
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<p>Rewind ID: { rewindId }</p>
						<Notice variant="info" title={ __( 'Important' ) }>
							{ __(
								'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
							) }
						</Notice>
						<HStack justify="flex-start">
							<Button variant="primary" type="submit" icon={ rotateLeft }>
								{ __( 'Restore now' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default SiteBackupRestore;
