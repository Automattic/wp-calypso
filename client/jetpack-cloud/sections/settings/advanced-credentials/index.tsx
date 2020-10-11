/**
 * External dependencies
 */
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { ConnectionStatus, StatusState } from './connection-status';
import {
	Credentials,
	FormMode,
	FormState,
	INITIAL_FORM_ERRORS,
	INITIAL_FORM_STATE,
	validate,
} from './form';
import { deleteCredentials, updateCredentials } from 'calypso/state/jetpack/credentials/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import CredentialsForm from './credentials-form';
import DocumentHead from 'calypso/components/data/document-head';
import getJetpackCredentialsUpdateError from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import Gridicon from 'calypso/components/gridicon';
import HostSelection from './host-selection';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import StepProgress from 'calypso/components/step-progress';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	host?: string;
	role: string;
}

const AdvancedCredentials: FunctionComponent< Props > = ( { host, role } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	const [ formState, setFormState ] = useState( INITIAL_FORM_STATE );
	const [ formErrors, setFormErrors ] = useState( INITIAL_FORM_ERRORS );
	const [ formMode, setFormMode ] = useState( FormMode.Password );
	const [ requestedCredentialsSave, setRequestedCredentialsSave ] = useState( false );
	const [ requestedCredentialsEdit, setRequestedCredentialsEdit ] = useState( false );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const formSubmissionStatus = useSelector(
		( state ) =>
			getJetpackCredentialsUpdateStatus( state, siteId ) as
				| 'unsubmitted'
				| 'pending'
				| 'success'
				| 'failed'
	);

	const formSubmissionError = useSelector( ( state ) =>
		getJetpackCredentialsUpdateError( state, siteId )
	);

	const { state: backupState, credentials } = useSelector( ( state ) =>
		getRewindState( state, siteId )
	) as {
		state?: string;
		credentials: FormState[] | undefined;
	};

	// when credentials load, merge w/ the form state
	useEffect( () => {
		// TODO: update form state logic
		const foundCredentials = !! credentials && ( find( credentials, { role } ) as Credentials );
		if ( foundCredentials ) {
			const { type, ...otherProperties } = foundCredentials;
			setFormState( { ...otherProperties, protocol: type, pass: '', kpri: '' } );
		}
	}, [ credentials, role ] );

	// validate changes to the credentials form
	useEffect( () => {
		setFormErrors( validate( formState, formMode ) );
	}, [ formState, formMode ] );

	// if a new error occurs from a form submission add that to the errors
	useEffect( () => {
		if ( null !== formSubmissionError ) {
			switch ( formSubmissionError.code ) {
				case 'invalid_wordpress_path':
					setFormErrors( {
						path: {
							message: translate(
								'WordPress could not be found in this folder, please check the path was entered correctly'
							),
							waitForInteraction: false,
						},
					} );
					break;
				// TODO: more cases that could be added here
			}
		}
	}, [ setFormErrors, formSubmissionError, translate ] );

	const handleDeleteCredentials = () => {
		dispatch( deleteCredentials( siteId, role ) );
	};

	const handleUpdateCredentials = () => {
		if ( ! isEmpty( formErrors ) ) {
			return;
		}

		setRequestedCredentialsSave( true );
		dispatch( updateCredentials( siteId, { role, ...formState } ) );
	};

	const getStatusState = ( currentBackupState: string | undefined ): StatusState => {
		switch ( currentBackupState ) {
			case 'uninitialized':
			case undefined:
				return StatusState.Loading;
			case 'provisioning':
			case 'active':
				return StatusState.Connected;
			case 'inactive':
			case 'awaiting_credentials':
			case 'unavailable':
			default:
				return StatusState.Disconnected;
		}
	};

	const statusState = getStatusState( backupState );

	const getCurrentStep = () => {
		if ( host === undefined ) {
			return 0;
		} else if ( requestedCredentialsSave ) {
			return 2;
		} else if ( statusState === StatusState.Connected ) {
			return 3;
		}
		return 1;
	};

	const render = ( status: StatusState ) => {
		if ( status === StatusState.Loading ) {
			// TODO:, placeholder
			return <div></div>;
		}

		if ( requestedCredentialsEdit && status === StatusState.Connected ) {
			return (
				<CredentialsForm
					disabled={ 'pending' === formSubmissionStatus }
					formErrors={ formErrors }
					formMode={ formMode }
					formState={ formState }
					host={ 'generic' }
					onFormStateChange={ setFormState }
					onModeChange={ setFormMode }
				>
					<Button scary onClick={ handleDeleteCredentials }>
						{ translate( 'Delete Credentials' ) }
					</Button>
					<Button onClick={ handleUpdateCredentials } disabled={ ! isEmpty( formErrors ) }>
						{ translate( 'Update credentials' ) }
					</Button>
				</CredentialsForm>
			);
		}

		if ( status === StatusState.Connected ) {
			return (
				<div>
					<Button
						borderless
						className="advanced-credentials__connected"
						onClick={ () => setRequestedCredentialsEdit( true ) }
					>
						{ translate(
							'The remote server credentials for %(siteSlug)s are present and correct, allowing Jetpack to perform restores and security fixes when required.',
							{
								args: {
									siteSlug,
								},
							}
						) }
						<Gridicon icon="chevron-right" />
					</Button>
				</div>
			);
		} else if ( host === undefined ) {
			return <HostSelection />;
		}

		return (
			<div>
				<CredentialsForm
					disabled={ 'pending' === formSubmissionStatus }
					formErrors={ formErrors }
					formMode={ formMode }
					formState={ formState }
					host={ host }
					onFormStateChange={ setFormState }
					onModeChange={ setFormMode }
				>
					<Button compact borderless href={ settingsPath( siteSlug ) }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Change host' ) }
					</Button>
					<Button primary onClick={ handleUpdateCredentials } disabled={ ! isEmpty( formErrors ) }>
						{ translate( 'Save credentials' ) }
					</Button>
				</CredentialsForm>
			</div>
		);
	};

	return (
		<Main className="advanced-credentials">
			<QueryRewindState siteId={ siteId } poll />
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<PageViewTracker
				path={ settingsPath( ':site' ) }
				title="Advanced Credentials"
				properties={ { step: getCurrentStep() } }
			/>
			<Card className="advanced-credentials__server-connection-status">
				<div className="advanced-credentials__server-connection-status-content">
					<h3>{ translate( 'Remote server credentials' ) }</h3>
					<ConnectionStatus state={ statusState } />
				</div>
			</Card>
			<Card>
				{ ! [ StatusState.Loading, StatusState.Connected ].includes( statusState ) && (
					<StepProgress currentStep={ getCurrentStep() } steps={ steps } />
				) }
				{ render( statusState ) }
			</Card>
		</Main>
	);
};

export default AdvancedCredentials;
