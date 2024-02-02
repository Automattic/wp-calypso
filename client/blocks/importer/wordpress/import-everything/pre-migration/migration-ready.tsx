import { JetpackLogo } from '@automattic/components';
import { NextButton, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StartImportTrackingProps } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/types';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { isNewSite } from 'calypso/state/sites/selectors';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import ConfirmModal from './confirm-modal';
import { CredentialsCta } from './credentials-cta';
import type { SiteId, SiteSlug } from 'calypso/types';

interface Props {
	sourceSiteSlug: SiteSlug;
	sourceSiteHasCredentials: boolean;
	targetSiteId: SiteId;
	targetSiteSlug: SiteSlug;
	migrationTrackingProps?: Record< string, unknown >;
	startImport: ( props?: StartImportTrackingProps ) => void;
	onProvideCredentialsClick: () => void;
}

export function MigrationReady( props: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		sourceSiteSlug,
		sourceSiteHasCredentials,
		targetSiteId,
		targetSiteSlug,
		migrationTrackingProps = {},
		startImport,
		onProvideCredentialsClick,
	} = props;

	const isNewlyCreatedSite = useSelector( ( state: object ) => isNewSite( state, targetSiteId ) );
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );
	const isFetchingUserSettingsSelector = useSelector( ( state: object ) =>
		isFetchingUserSettings( state )
	);

	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ migrationConfirmed, setMigrationConfirmed ] = useMigrationConfirmation();

	useEffect( () => {
		const _migrationTrackingProps: { [ key: string ]: unknown } = { ...migrationTrackingProps };
		// There is a case where source_site_id is 0|undefined, so we need to delete it
		delete _migrationTrackingProps?.source_site_id;

		dispatch( recordTracksEvent( 'calypso_site_migration_ready_screen', _migrationTrackingProps ) );
	}, [ migrationTrackingProps, dispatch ] );

	// If it's a newly created site, we don't need to show the confirm modal
	useEffect( () => {
		if ( isNewlyCreatedSite ) {
			setMigrationConfirmed( true );
		}
	}, [ isNewlyCreatedSite, setMigrationConfirmed ] );

	useEffect( () => {
		if ( isDevAccount ) {
			onProvideCredentialsClick();
		}
	}, [ isDevAccount, onProvideCredentialsClick ] );

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

	return (
		<>
			<QueryUserSettings />
			{ showConfirmModal && (
				<ConfirmModal
					sourceSiteSlug={ sourceSiteSlug }
					targetSiteSlug={ targetSiteSlug }
					onClose={ hideConfirmModal }
					onConfirm={ () => {
						// reset migration confirmation to initial state
						setMigrationConfirmed( false );
						startImport( { type: 'without-credentials', ...migrationTrackingProps } );
					} }
				/>
			) }
			{ isFetchingUserSettingsSelector ? (
				<div className="import-layout__center">
					<LoadingEllipsis />
				</div>
			) : (
				<div className="import__pre-migration import__import-everything import__import-everything--redesign">
					<div className="import__heading import__heading-center">
						<Title>
							{ translate( 'Your site is ready {{br/}}for its brand new home', {
								components: {
									br: <br />,
								},
							} ) }
						</Title>
					</div>
					<div className="pre-migration__main-content">
						<div className="pre-migration__main-content-primary-text">
							{ translate(
								"Enjoy a hassle-free migration process where we smoothly move your {{br/}}website's content, media files, themes, plugins, and settings.",
								{
									components: {
										br: <br />,
									},
								}
							) }
						</div>
						<div className="pre-migration__main-content-secondary-text">
							{ translate(
								'Unlock the benefits of {{strong}}WordPress.com{{/strong}} without any disruption.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</div>
					</div>
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
					{ ! sourceSiteHasCredentials && (
						<CredentialsCta onButtonClick={ onProvideCredentialsClick } />
					) }
					<div className="pre-migration__footer-jetpack-powered">
						<JetpackLogo monochrome size={ 18 } /> <span>{ translate( 'Jetpack powered' ) }</span>
					</div>
				</div>
			) }
		</>
	);
}
