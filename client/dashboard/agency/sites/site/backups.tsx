import { agencySiteQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, backup as backupIcon } from '@wordpress/icons';
import { agencySiteRoute } from '../../../app/router/agency';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { Text } from '../../../components/text';
import { BackupFileBrowserProvider } from '../../../sites/backups/backup-file-browser-provider';

export default function AgencySiteBackups() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( agencySiteQuery( siteSlug ) );

	if ( ! site?.has_backup ) {
		return (
			<PageLayout header={ <PageHeader title={ __( 'Backups' ) } /> }>
				<Card>
					<CardBody>
						<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
							<Icon icon={ backupIcon } />
							<Text variant="muted">{ __( 'Backups aren’t enabled for this site.' ) }</Text>
						</HStack>
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	return (
		<BackupFileBrowserProvider>
			<Outlet />
		</BackupFileBrowserProvider>
	);
}
