import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { NextButton, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSiteMigrateInfo } from 'calypso/blocks/importer/hooks/use-site-can-migrate';
import { formatSlugToURL } from 'calypso/blocks/importer/util';
import MigrationCredentialsForm from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/migration-credentials-form';
import { UpdatePluginInfo } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/update-plugins';
import { PreMigrationUpgradePlan } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/upgrade-plan';
import { FormState } from 'calypso/components/advanced-credentials/form';
import QuerySites from 'calypso/components/data/query-sites';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import NotAuthorized from '../../../components/not-authorized';
import ConfirmModal from './confirm-modal';
import { CredentialsHelper } from './credentials-helper';
import { StartImportTrackingProps } from './types';

import './style.scss';

interface PreMigrationProps {
	sourceSite?: SiteDetails;
	targetSite: SiteDetails;
	initImportRun?: boolean;
	isTrial?: boolean;
	isMigrateFromWp: boolean;
	isTargetSitePlanCompatible: boolean;
	startImport: ( props?: StartImportTrackingProps ) => void;
	onFreeTrialClick: () => void;
	onContentOnlyClick: () => void;
	onNotAuthorizedClick: () => void;
}

export const PreMigrationScreen: React.FunctionComponent< PreMigrationProps > = (
	props: PreMigrationProps
) => {
	const {
		sourceSite,
		targetSite,
		initImportRun,
		isTargetSitePlanCompatible,
		isMigrateFromWp,
		isTrial,
		startImport,
		onFreeTrialClick,
		onContentOnlyClick,
		onNotAuthorizedClick,
	} = props;

	const translate = useTranslate();
	const dispatch = useDispatch();
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) ?? '';
	const sourceSiteUrl = formatSlugToURL( sourceSiteSlug );

	const [ showCredentials, setShowCredentials ] = useState( false );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ migrationConfirmed, setMigrationConfirmed ] = useMigrationConfirmation();
	const [ selectedHost, setSelectedHost ] = useState( 'generic' );
	const [ selectedProtocol, setSelectedProtocol ] = useState< 'ftp' | 'ssh' >( 'ftp' );
	const [ hasLoaded, setHasLoaded ] = useState( false );
	const [ continueImport, setContinueImport ] = useState( false );

	const {
		sourceSiteId,
		fetchMigrationEnabledStatus,
		isFetchingData: isFetchingMigrationData,
		siteCanMigrate,
	} = useSiteMigrateInfo( targetSite.ID, sourceSiteSlug, isTargetSitePlanCompatible );

	const showUpdatePluginInfo = typeof siteCanMigrate === 'boolean' ? ! siteCanMigrate : false;

	const migrationTrackingProps = {
		source_site_id: sourceSiteId,
		source_site_url: sourceSiteUrl,
		target_site_id: targetSite.ID,
		target_site_slug: targetSite.slug,
		is_migrate_from_wp: isMigrateFromWp,
		is_trial: isTrial,
	};

	const toggleCredentialsForm = () => {
		setShowCredentials( ! showCredentials );
		dispatch(
			recordTracksEvent( 'calypso_site_migration_credentials_form_toggle', migrationTrackingProps )
		);
	};

	const [ queryTargetSitePlanStatus, setQueryTargetSitePlanStatus ] = useState<
		'init' | 'fetching' | 'fetched'
	>( 'init' );

	const isRequestingTargetSitePlans = useSelector( ( state ) =>
		isRequestingSitePlans( state, targetSite.ID )
	);

	useEffect( () => {
		if ( queryTargetSitePlanStatus === 'fetching' && ! isRequestingTargetSitePlans ) {
			setQueryTargetSitePlanStatus( 'fetched' );
			setContinueImport( true );
			fetchMigrationEnabledStatus();
		}
	}, [ queryTargetSitePlanStatus, isRequestingTargetSitePlans, fetchMigrationEnabledStatus ] );

	const { isLoading: isAddingTrial } = useAddHostingTrialMutation( {
		onSuccess: () => {
			setQueryTargetSitePlanStatus( 'fetching' );
		},
	} );

	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, sourceSiteId, 'main' )
	) as FormState & { abspath: string };

	const hasCredentials = credentials && Object.keys( credentials ).length > 0;

	const isRequestingCredentials = useSelector( ( state ) =>
		isRequestingSiteCredentials( state, sourceSiteId as number )
	);

	const changeCredentialsHelperHost = ( host: string ) => {
		setSelectedHost( host );
	};

	const changeCredentialsProtocol = ( protocol: 'ftp' | 'ssh' ) => {
		setSelectedProtocol( protocol );
	};

	const onUpgradeAndMigrateClick = () => {
		setContinueImport( true );
		fetchMigrationEnabledStatus();
	};

	// We want to record the tracks event, so we use the same condition as the one in the render function
	// This should be better handled by using a state after the refactor
	useEffect( () => {
		if ( ! showUpdatePluginInfo && isTargetSitePlanCompatible ) {
			const _migrationTrackingProps: { [ key: string ]: unknown } = { ...migrationTrackingProps };
			// There is a case where source_site_id is 0|undefined, so we need to delete it
			delete _migrationTrackingProps?.source_site_id;

			dispatch(
				recordTracksEvent( 'calypso_site_migration_ready_screen', _migrationTrackingProps )
			);
		}
	}, [ showUpdatePluginInfo, isTargetSitePlanCompatible ] );

	// Initiate the migration if initImportRun is set
	useEffect( () => {
		initImportRun && startImport( { type: 'without-credentials', ...migrationTrackingProps } );
	}, [] );

	useEffect( () => {
		if ( isTargetSitePlanCompatible && sourceSiteId ) {
			dispatch( getCredentials( sourceSiteId ) );
			setHasLoaded( true );
		}
	}, [ isTargetSitePlanCompatible, sourceSiteId, dispatch ] );

	useEffect( () => {
		// If we are blocked by plugin upgrade check or has continueImport set to false, we do not start the migration
		if ( showUpdatePluginInfo || ! continueImport ) {
			return;
		}
		if ( sourceSiteId ) {
			startImport( migrationTrackingProps );
		}
	}, [ continueImport, sourceSiteId, startImport, showUpdatePluginInfo ] );

	function renderCredentialsFormSection() {
		// We do not show the credentials form if we already have credentials
		if ( hasCredentials ) {
			return;
		}

		return (
			<>
				{ ! showCredentials && (
					<div className="pre-migration__content pre-migration__credentials">
						{ translate(
							'Want to speed up the migration? {{button}}Provide the server credentials{{/button}} of your site',
							{
								components: {
									button: (
										<Button
											borderless={ true }
											className="action-buttons__borderless"
											onClick={ toggleCredentialsForm }
										/>
									),
								},
							}
						) }
					</div>
				) }
				{ showCredentials && sourceSite && (
					<div className="pre-migration__form-container pre-migration__credentials-form">
						<div className="pre-migration__form">
							<MigrationCredentialsForm
								sourceSite={ sourceSite }
								targetSite={ targetSite }
								startImport={ startImport }
								selectedHost={ selectedHost }
								migrationTrackingProps={ migrationTrackingProps }
								onChangeProtocol={ changeCredentialsProtocol }
							/>
						</div>
						<div className="pre-migration__credentials-help">
							<CredentialsHelper
								onHostChange={ changeCredentialsHelperHost }
								selectedProtocol={ selectedProtocol }
							/>
						</div>
					</div>
				) }
			</>
		);
	}

	function renderPreMigration() {
		// Show a loading state when we are trying to fetch existing credentials
		if ( ! hasLoaded || isRequestingCredentials ) {
			return <LoadingEllipsis />;
		}

		if ( ! sourceSite || ( sourceSite && sourceSite.ID !== sourceSiteId ) ) {
			<NotAuthorized
				onStartBuilding={ onNotAuthorizedClick }
				onStartBuildingText={ translate( 'Skip to dashboard' ) }
			/>;
		}

		return (
			<>
				{ showConfirmModal && (
					<ConfirmModal
						sourceSiteSlug={ sourceSiteSlug }
						targetSiteSlug={ targetSite.slug }
						onClose={ hideConfirmModal }
						onConfirm={ () => {
							// reset migration confirmation to initial state
							setMigrationConfirmed( false );
							startImport( { type: 'without-credentials', ...migrationTrackingProps } );
						} }
					/>
				) }
				<div className="import__pre-migration import__import-everything import__import-everything--redesign">
					<div className="import__heading-title">
						<Title>{ translate( 'You are ready to migrate' ) }</Title>
					</div>
					{ renderCredentialsFormSection() }
					{ ! showCredentials && (
						<div className="import__footer-button-container pre-migration__proceed">
							<NextButton
								type="button"
								onClick={ () => {
									migrationConfirmed
										? startImport( { type: 'without-credentials', ...migrationTrackingProps } )
										: displayConfirmModal();
								} }
							>
								{ translate( 'Start migration' ) }
							</NextButton>
						</div>
					) }
				</div>
			</>
		);
	}

	function displayConfirmModal() {
		dispatch(
			recordTracksEvent( 'calypso_site_migration_confirm_modal_display', migrationTrackingProps )
		);

		setShowConfirmModal( true );
	}

	function hideConfirmModal() {
		dispatch(
			recordTracksEvent( 'calypso_site_migration_confirm_modal_hide', migrationTrackingProps )
		);

		setShowConfirmModal( false );
	}

	function renderUpdatePluginInfo() {
		return (
			<>
				<UpdatePluginInfo
					isMigrateFromWp={ isMigrateFromWp }
					sourceSiteUrl={ sourceSiteUrl }
					migrationTrackingProps={ migrationTrackingProps }
				/>
				<Interval onTick={ fetchMigrationEnabledStatus } period={ EVERY_FIVE_SECONDS } />
			</>
		);
	}

	function renderUpgradePlan() {
		return (
			<>
				{ queryTargetSitePlanStatus === 'fetching' && <QuerySites siteId={ targetSite.ID } /> }
				<PreMigrationUpgradePlan
					sourceSiteSlug={ sourceSiteSlug }
					sourceSiteUrl={ sourceSiteUrl }
					targetSite={ targetSite }
					startImport={ onUpgradeAndMigrateClick }
					onFreeTrialClick={ onFreeTrialClick }
					onContentOnlyClick={ onContentOnlyClick }
					isBusy={
						isFetchingMigrationData || isAddingTrial || queryTargetSitePlanStatus === 'fetched'
					}
					migrationTrackingProps={ migrationTrackingProps }
				/>
			</>
		);
	}

	function render() {
		// If the source site is not capable of being migrated, we show the update info screen
		if ( showUpdatePluginInfo ) {
			return renderUpdatePluginInfo();
		}

		// If the target site is plan compatible, we show the pre-migration screen
		if ( isTargetSitePlanCompatible ) {
			return renderPreMigration();
		}

		// If the target site is not plan compatible, we show the upgrade plan screen
		return renderUpgradePlan();
	}

	return render();
};

export default PreMigrationScreen;
