import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CredentialsFormAdvanced from 'calypso/components/advanced-credentials/credentials-form';
import {
	FormMode,
	FormState,
	INITIAL_FORM_ERRORS,
	INITIAL_FORM_STATE,
	validate,
} from 'calypso/components/advanced-credentials/form';
import { useMigrateProvisionMutation } from 'calypso/data/site-migration/migrate-provision-mutation';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentialsUpdateError from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import { isNewSite } from 'calypso/state/sites/selectors';
import ConfirmModal from './confirm-modal';
import type { CredentialsProtocol, CredentialsStatus, StartImportTrackingProps } from './types';

interface Props {
	sourceSite: SiteDetails;
	targetSite: SiteDetails;
	startImport: ( props?: StartImportTrackingProps ) => void;
	selectedHost: string;
	migrationTrackingProps: StartImportTrackingProps;
	onChangeProtocol: ( protocol: CredentialsProtocol ) => void;
	allowFtp?: boolean;
}

export const CredentialsForm: React.FunctionComponent< Props > = ( props ) => {
	const { sourceSite, targetSite, migrationTrackingProps, startImport, allowFtp } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { hostname } = new URL( sourceSite.URL );
	const [ formState, setFormState ] = useState( {
		...INITIAL_FORM_STATE,
		host: hostname,
		...( ! allowFtp ? { protocol: 'ssh', port: 22 } : {} ),
	} as FormState );
	const [ formErrors, setFormErrors ] = useState( INITIAL_FORM_ERRORS );
	const [ formMode, setFormMode ] = useState( FormMode.Password );
	const [ hasMissingFields, setHasMissingFields ] = useState( false );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ confirmCallback, setConfirmCallback ] = useState< () => void >();
	const [ migrationConfirmed, setMigrationConfirmed ] = useMigrationConfirmation();

	const formSubmissionStatus: CredentialsStatus = useSelector( ( state ) =>
		getJetpackCredentialsUpdateStatus( state, sourceSite.ID )
	);
	const isNewlyCreatedSite = useSelector( ( state: object ) => isNewSite( state, targetSite.ID ) );

	const isFormSubmissionPending = formSubmissionStatus === 'pending';
	const formHasErrors = formErrors && Object.keys( formErrors ).length > 0;
	const updateError = useSelector( ( state ) =>
		getJetpackCredentialsUpdateError( state, sourceSite.ID )
	);

	const startImportCallback = useCallback(
		( args: StartImportTrackingProps ) => {
			// reset migration confirmation to initial state
			setMigrationConfirmed( false );
			setShowConfirmModal( false );
			startImport( args );
		},
		[ startImport ]
	);

	const handleUpdateCredentials = () => {
		if ( formHasErrors ) {
			return;
		}

		const credentials = { ...formState };

		if ( formMode === FormMode.Password ) {
			credentials.kpri = '';
		} else if ( formMode === FormMode.PrivateKey ) {
			credentials.pass = '';
		}

		dispatch( recordTracksEvent( 'calypso_site_migration_credentials_update' ) );
		dispatch( updateCredentials( sourceSite.ID, credentials, true, false ) );
	};

	const { migrateProvision, isPending, isError, error } =
		useMigrateProvisionMutation( handleUpdateCredentials );

	const submitCredentials = useCallback(
		( e: React.SyntheticEvent ) => {
			const _confirmCallback = () => {
				setShowConfirmModal( false );
				setMigrationConfirmed( true );
				setHasMissingFields( false );
				// If the form is submitted with errors, prevent the submission and show the errors.
				if ( formHasErrors ) {
					setHasMissingFields( true );
					return;
				}

				migrateProvision( targetSite.ID, sourceSite.ID, true );
			};

			e.preventDefault();
			setConfirmCallback( () => _confirmCallback );
			migrationConfirmed ? _confirmCallback?.() : setShowConfirmModal( true );
		},
		[
			formHasErrors,
			migrationConfirmed,
			migrateProvision,
			targetSite,
			sourceSite,
			setShowConfirmModal,
			setMigrationConfirmed,
			setHasMissingFields,
		]
	);

	// Clear the hasMissingFields flag when there are no more errors.
	useEffect( () => {
		! formHasErrors && setHasMissingFields( false );
	}, [ formErrors ] );

	// validate changes to the credentials form
	useEffect( () => {
		const errors = validate( formState, formMode );

		// Shorten the root user error message as the original message used in the form is too long.
		if ( formState.user === 'root' ) {
			errors.user = {
				message: translate( "We can't accept credentials for the root user." ),
				waitForInteraction: true,
			};
		}

		if ( typeof formState.port === 'string' ) {
			errors.port = {
				message: translate( 'Invalid port.' ),
				waitForInteraction: true,
			};
		}

		setFormErrors( errors );
	}, [ formState, formMode ] );

	useEffect( () => {
		props.onChangeProtocol( formState.protocol as CredentialsProtocol );
	}, [ formState.protocol ] );

	useEffect( () => {
		switch ( formSubmissionStatus ) {
			case 'success':
				startImportCallback( { type: 'with-credentials', ...migrationTrackingProps } );
				break;
		}
	}, [ formSubmissionStatus, startImportCallback ] );

	useEffect( () => {
		updateError &&
			dispatch( recordTracksEvent( 'calypso_site_migration_credentials_update_error' ) );
	}, [ updateError ] );

	// If it's a newly created site, we don't need to show the confirm modal
	useEffect( () => {
		if ( isNewlyCreatedSite ) {
			setMigrationConfirmed( true );
		}
	}, [ isNewlyCreatedSite, setMigrationConfirmed ] );

	return (
		<>
			{ showConfirmModal && (
				<ConfirmModal
					sourceSiteSlug={ sourceSite.slug }
					targetSiteSlug={ targetSite.slug }
					onClose={ () => {
						setShowConfirmModal( false );
						setConfirmCallback( undefined );
					} }
					onConfirm={ () => confirmCallback?.() }
				/>
			) }
			<form onSubmit={ submitCredentials }>
				<CredentialsFormAdvanced
					disabled={ isFormSubmissionPending || isPending }
					formErrors={ formErrors }
					formMode={ formMode }
					formModeSwitcher="simple"
					formState={ formState }
					host={ props.selectedHost }
					role="main"
					onFormStateChange={ setFormState }
					onModeChange={ setFormMode }
					withHeader={ false }
					allowFtp={ allowFtp }
				/>

				{ updateError && (
					<div className="pre-migration__content pre-migration__error">
						{ updateError.translatedError }
					</div>
				) }

				{ isError && error instanceof Error && (
					<div className="pre-migration__content pre-migration__error">
						{ translate( 'We could not store your credentials:' ) } { error.message }
					</div>
				) }

				{ hasMissingFields && formHasErrors && (
					<div className="pre-migration__content pre-migration__error">
						{ translate(
							'Please make sure all fields are filled in correctly before proceeding.'
						) }
					</div>
				) }

				<div className="credentials-form__actions">
					<NextButton type="submit" isBusy={ isFormSubmissionPending || isPending }>
						{ isFormSubmissionPending || isPending
							? translate( 'Testing credentials' )
							: translate( 'Start migration' ) }
					</NextButton>
					<div>
						<Button
							borderless
							className="action-buttons__borderless"
							onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
								e.preventDefault();

								if ( ! migrationConfirmed ) {
									setShowConfirmModal( true );
									setConfirmCallback( () =>
										startImportCallback.bind( null, {
											type: 'skip-credentials',
											...migrationTrackingProps,
										} )
									);
								} else {
									startImportCallback( { type: 'skip-credentials', ...migrationTrackingProps } );
								}
							} }
						>
							{ translate( 'Skip credentials' ) }
						</Button>
						&nbsp;
						{ translate( 'for a slower setup' ) }
					</div>
				</div>
			</form>
		</>
	);
};

export default CredentialsForm;
