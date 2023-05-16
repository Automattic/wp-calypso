//Migration SSH/FTP credentials form

import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CredentialsForm from 'calypso/components/advanced-credentials/credentials-form';
import {
	FormMode,
	INITIAL_FORM_ERRORS,
	INITIAL_FORM_STATE,
	validate,
} from 'calypso/components/advanced-credentials/form';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentialsUpdateError from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';

interface Props {
	siteId: number | null;
	startImport: () => void;
}

export const MigrationCredentialsForm: React.FunctionComponent< Props > = ( props ) => {
	const { siteId, startImport } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ formState, setFormState ] = useState( INITIAL_FORM_STATE );
	const [ formErrors, setFormErrors ] = useState( INITIAL_FORM_ERRORS );
	const [ formMode, setFormMode ] = useState( FormMode.Password );

	const formSubmissionStatus = useSelector(
		( state ) =>
			getJetpackCredentialsUpdateStatus( state, siteId ) as
				| 'unsubmitted'
				| 'pending'
				| 'success'
				| 'failed'
	);

	const isFormSubmissionPending = formSubmissionStatus === 'pending';
	const formHasErrors = formErrors && Object.keys( formErrors ).length > 0;

	// validate changes to the credentials form
	useEffect( () => {
		setFormErrors( validate( formState, formMode ) );
	}, [ formState, formMode ] );

	const handleUpdateCredentials = useCallback(
		( e ) => {
			e.preventDefault();

			// First provision the site if necessary.

			if ( formHasErrors ) {
				return;
			}

			const credentials = { ...formState };

			if ( formMode === FormMode.Password ) {
				credentials.kpri = '';
			} else if ( formMode === FormMode.PrivateKey ) {
				credentials.pass = '';
			}

			// @todo custom event for migration flow?
			dispatch(
				recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_update' )
			);
			dispatch( updateCredentials( siteId, credentials, true, false ) );
		},
		[ formHasErrors, dispatch, siteId, formState, formMode ]
	);

	const updateError = useSelector( ( state ) => getJetpackCredentialsUpdateError( state, siteId ) );
	return (
		<>
			<form onSubmit={ handleUpdateCredentials }>
				<CredentialsForm
					disabled={ isFormSubmissionPending }
					formErrors={ formErrors }
					formMode={ formMode }
					formState={ formState }
					host="bluehost"
					role="main"
					onFormStateChange={ setFormState }
					onModeChange={ setFormMode }
					withHeader={ false }
				/>

				{ updateError && (
					<div className="pre-migration__content pre-migration__error">
						{ updateError.translatedError }
					</div>
				) }

				<div className="pre-migration__content pre-migration__proceed pre-migration__credential-buttons">
					<NextButton
						type="submit"
						isBusy={ isFormSubmissionPending }
						className="pre-migration__form-submit-btn"
						disabled={ formHasErrors }
					>
						{ isFormSubmissionPending
							? translate( 'Testing credentials' )
							: translate( 'Start migration' ) }
					</NextButton>
					<button className="action" onClick={ startImport }>
						{ translate( 'Skip credentials (slower setup)' ) }
					</button>
				</div>
			</form>
		</>
	);
};

export default MigrationCredentialsForm;
