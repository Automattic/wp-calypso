import { agencySiteQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, backup as backupIcon } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { FileBrowserProvider } from '../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useLocale } from '../../../app/locale';
import { agencySiteRoute } from '../../../app/router/agency';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { Text } from '../../../components/text';

export default function AgencySiteBackups() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( agencySiteQuery( siteSlug ) );
	const locale = useLocale();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );

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

	const notices = {
		showError: ( message: string ) => createErrorNotice( message, { type: 'snackbar' } ),
		showSuccess: ( message: string ) => createSuccessNotice( message, { type: 'snackbar' } ),
	};

	return (
		<FileBrowserProvider locale={ locale } notices={ notices }>
			<Outlet />
		</FileBrowserProvider>
	);
}
