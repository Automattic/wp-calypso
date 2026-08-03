import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteBackupRestoreRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackupRestoreFlow } from './flow';

function SiteBackupRestore() {
	const { siteSlug, rewindId } = siteBackupRestoreRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Site restore' ) } />
			}
		>
			<BackupRestoreFlow site={ site } rewindId={ rewindId } />
		</PageLayout>
	);
}

export default SiteBackupRestore;
