import { allSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useLocale } from '../../../app/locale';
import { DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { AgencyNotices } from '../../components/agency-notices';
import DesignPreviewControls, { useDesignPreview } from '../../design-preview';
import MissingPaymentSettingsNotice, {
	useMissingPaymentSettings,
} from '../missing-payment-settings-notice';
import MigrationsCommissionsContent from './commissions-content';
import useCanTagSitesForCommission from './hooks/use-can-tag-sites-for-commission';
import useFetchTaggedSitesForMigration from './hooks/use-fetch-tagged-sites-for-migration';

export default function EarnMigrations() {
	const preview = useDesignPreview();
	return (
		<>
			<DesignPreviewControls surface="migrations" />
			<EarnMigrationsContent key={ preview.migrationsActive ? preview.migrations : 'live' } />
		</>
	);
}

function EarnMigrationsContent() {
	const preview = useDesignPreview();
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { canTagSitesForCommission: liveCanTag, migrationTags } = useCanTagSitesForCommission();
	const { data: sites = [] } = useQuery( allSitesQuery() );
	const { data, isLoading: liveLoading } = useFetchTaggedSitesForMigration();
	const taggedSites = preview.migrationsActive ? preview.tagged : ( data ?? [] );
	const isLoading = preview.migrationsActive ? preview.migrations === 'loading' : liveLoading;
	const canTagSitesForCommission = preview.migrationsActive ? preview.canTag : liveCanTag;
	const hasCommissionActivity = ! preview.migrationsActive && taggedSites.length > 0;
	const missingPaymentSettings = useMissingPaymentSettings( {
		hasCommissionActivity,
		isLoadingActivity: isLoading,
	} );

	const [ isAddSitesModalOpen, setIsAddSitesModalOpen ] = useState( false );

	const getSiteCreatedAt = useCallback(
		( blogId: number ) => sites.find( ( site ) => site?.ID === blogId )?.options?.created_at,
		[ sites ]
	);

	const onSuccess = useCallback(
		( message: string, options?: { id?: string; duration?: number } ) =>
			createSuccessNotice( message, { type: 'snackbar', id: options?.id } ),
		[ createSuccessNotice ]
	);

	const onError = useCallback(
		( message: string ) => createErrorNotice( message, { type: 'snackbar' } ),
		[ createErrorNotice ]
	);

	const onOpenAddSitesModal = useCallback( () => {
		recordTracksEvent( 'calypso_a4a_migrations_commissions_tag_sites_click' );
		setIsAddSitesModalOpen( true );
	}, [ recordTracksEvent ] );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Migrations' ) }
					description={ __( 'Earn commissions for migrating sites to Automattic hosting.' ) }
					actions={
						canTagSitesForCommission ? (
							<Button variant="primary" __next40pxDefaultSize onClick={ onOpenAddSitesModal }>
								{ __( 'Tag sites for commission' ) }
							</Button>
						) : undefined
					}
				/>
			}
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'missing-payment-settings',
							...missingPaymentSettings,
							notice: (
								<MissingPaymentSettingsNotice
									hasCommissionActivity={ hasCommissionActivity }
									commissionType="migrations"
								/>
							),
						},
					] }
				/>
			}
		>
			<MigrationsCommissionsContent
				taggedSites={ taggedSites }
				isLoading={ isLoading }
				recordTracksEvent={ recordTracksEvent }
				onSuccess={ onSuccess }
				onError={ onError }
				getSiteCreatedAt={ getSiteCreatedAt }
				locale={ locale }
				canTagSitesForCommission={ canTagSitesForCommission }
				migrationTags={ migrationTags }
				isAddSitesModalOpen={ isAddSitesModalOpen }
				onCloseAddSitesModal={ () => setIsAddSitesModalOpen( false ) }
				onOpenAddSitesModal={ onOpenAddSitesModal }
				TableWrapper={ DataViewsCard }
			/>
		</PageLayout>
	);
}
