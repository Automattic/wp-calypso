import {
	IMPORT_HOSTED_SITE_FLOW,
	SITE_MIGRATION_FLOW,
	StepContainer,
} from '@automattic/onboarding';
import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	GroupableSiteLaunchStatuses,
} from '@automattic/sites';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { defer } from 'lodash';
import React, { useState, useEffect } from 'react';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';
import DocumentHead from 'calypso/components/data/document-head';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SitesDashboardQueryParams } from 'calypso/sites-dashboard/components/sites-content-controls';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import SitePicker from './site-picker';
import type { Step } from '../../types';
import type { SiteExcerptData } from '@automattic/sites';

import './styles.scss';

const SitePickerStep: Step = function SitePickerStep( { navigation, flow } ) {
	const { __ } = useI18n();
	const urlQueryParams = useQuery();
	const page = Number( urlQueryParams.get( 'page' ) ) || 1;
	const search = urlQueryParams.get( 'search' ) || '';
	const status =
		( urlQueryParams.get( 'status' ) as GroupableSiteLaunchStatuses ) ||
		DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE;
	const sourceSiteSlug = urlQueryParams.get( 'from' ) || '';
	const [ destinationSite, setDestinationSite ] = useState< SiteExcerptData >();
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ , setMigrationConfirmed ] = useMigrationConfirmation();
	const siteCount = useSelector( getCurrentUserSiteCount );

	useEffect( () => setMigrationConfirmed( false ), [] );

	useEffect( () => {
		// If the user has no sites, we should skip the site picker and go straight to the site creation step
		if ( siteCount === 0 ) {
			navigation.submit?.( { action: 'create-site' } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteCount ] );

	const onQueryParamChange = ( params: Partial< SitesDashboardQueryParams > ) => {
		recordTracksEvent( 'calypso_import_site_picker_query_param_change', params );
		navigation.submit?.( { action: 'update-query', queryParams: params } );
	};

	const createNewSite = () => {
		recordTracksEvent( 'calypso_import_site_picker_create_new_site' );
		navigation.submit?.( { action: 'create-site' } );
	};

	const selectSite = ( site: SiteExcerptData ) => {
		recordTracksEvent( 'calypso_import_site_picker_select_site', {
			id: site?.ID,
			slug: site?.slug,
			title: site?.title,
		} );
		navigation.submit?.( { action: 'select-site', site } );
	};

	const onSelectSite = ( site: SiteExcerptData ) => {
		setDestinationSite( site );
		setShowConfirmModal( true );
	};

	const renderConfirmModal = () => (
		<ConfirmModal
			onClose={ () => {
				setDestinationSite( undefined );
				setShowConfirmModal( false );
			} }
			onConfirm={ () => {
				setMigrationConfirmed( true );
				defer( () => destinationSite && selectSite( destinationSite ) );
			} }
		>
			<p>
				{ sprintf(
					/* translators: the `sourceSite` and `targetSite` fields could be any site URL (eg: "yourname.com") */
					__(
						'Your site %(sourceSite)s will be migrated to %(targetSite)s, overriding all the content in your destination site. '
					),
					{
						sourceSite: sourceSiteSlug,
						targetSite: destinationSite?.slug.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' ),
					}
				) }
			</p>
		</ConfirmModal>
	);

	return (
		<>
			<DocumentHead title={ __( 'Pick your destination' ) } />
			<StepContainer
				stepName="site-picker"
				hideBack={ IMPORT_HOSTED_SITE_FLOW !== flow }
				goBack={ navigation.goBack }
				hideSkip={ SITE_MIGRATION_FLOW === flow }
				skipLabelText={ __( 'Skip and create a new site' ) }
				goNext={ createNewSite }
				stepContent={
					<SitePicker
						page={ page }
						search={ search }
						status={ status }
						onCreateSite={ createNewSite }
						onSelectSite={ onSelectSite }
						onQueryParamChange={ onQueryParamChange }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
			{ showConfirmModal && renderConfirmModal() }
		</>
	);
};

export default SitePickerStep;
