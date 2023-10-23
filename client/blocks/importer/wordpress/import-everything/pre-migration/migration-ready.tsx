import { NextButton, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StartImportTrackingProps } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/types';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isNewSite } from 'calypso/state/sites/selectors';
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
			<div className="import__pre-migration import__import-everything import__import-everything--redesign">
				<div className="import__heading-title">
					<Title>{ translate( 'You are ready to migrate' ) }</Title>
				</div>
				{ ! sourceSiteHasCredentials && (
					<CredentialsCta onButtonClick={ onProvideCredentialsClick } />
				) }
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
			</div>
		</>
	);
}
