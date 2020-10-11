/**
 * External dependencies
 */
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, FormEventHandler, useState, useEffect } from 'react';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { ConnectionStatus, StatusState } from './connection-status';
import { deleteCredentials, updateCredentials } from 'state/jetpack/credentials/actions';
import { FormState, FormErrors, INITIAL_FORM_STATE } from './form';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { settingsPath } from 'lib/jetpack/paths';
import CredentialsForm from './credentials-form';
import DocumentHead from 'components/data/document-head';
import getJetpackCredentialsUpdateStatus from 'state/selectors/get-jetpack-credentials-update-status';
import getRewindState from 'state/selectors/get-rewind-state';
import Gridicon from 'components/gridicon';
import HostSelection from './host-selection';
import Main from 'components/main';
import QueryRewindState from 'components/data/query-rewind-state';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';
import Verification from './verification';

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
	const [ formErrors ] = useState< FormErrors >( {} );
	const [ requestedCredentialsSave ] = useState( false );
	const [ requestedCredentialsEdit, setRequestedCredentialsEdit ] = useState( false );
	// const hostInfo = getHostInfoFromId( host );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const formSubmissionStatus = useSelector( ( state ) =>
		getJetpackCredentialsUpdateStatus( state, siteId )
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
		const foundCredentials = !! credentials && find( credentials, { role } );
		foundCredentials && setFormState( foundCredentials );
	}, [ credentials, role ] );

	const handleDeleteCredentials = () => {
		dispatch( deleteCredentials( siteId, role ) );
	};

	const handleUpdateCredentials = () => {
		// TODO: check for missing fields

		if ( ! isEmpty( formErrors ) ) {
			return;
		}

		dispatch( updateCredentials( siteId, { role, ...formState } ) );
	};

	const updateFormState: FormEventHandler< HTMLInputElement > = ( { currentTarget } ) => {
		switch ( currentTarget.name ) {
			case 'protocol':
				setFormState( { ...formState, protocol: currentTarget.value as 'ftp' | 'ssh' } );
				break;
			case 'host':
				setFormState( { ...formState, host: currentTarget.value as string } );
				break;
			case 'port':
				setFormState( { ...formState, port: currentTarget.value as string } );
				break;
			case 'user':
				setFormState( { ...formState, user: currentTarget.value as string } );
				break;
			case 'pass':
				setFormState( { ...formState, pass: currentTarget.value as string } );
				break;
			case 'path':
				setFormState( { ...formState, path: currentTarget.value as string } );
				break;
			case 'kpri':
				setFormState( { ...formState, kpri: currentTarget.value as string } );
				break;
		}
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

	const getCurrentStep = () => {
		if ( host === undefined ) {
			return 0;
		}
		return 1;
	};

	const render = ( statusState: StatusState ) => {
		if ( statusState === StatusState.Loading ) {
			// TODO:, placeholder
			return <div></div>;
		}

		if ( 'pending' === formSubmissionStatus ) {
			return <Verification />;
		}

		if ( requestedCredentialsEdit && statusState === StatusState.Connected ) {
			return (
				<CredentialsForm
					handleFormChange={ updateFormState }
					host={ 'generic' }
					formState={ formState }
				>
					<Button scary onClick={ handleDeleteCredentials }>
						{ translate( 'Delete Credentials' ) }
					</Button>
					<Button
					// onClick={ onCredentialsSave }
					>
						{ translate( 'Update credentials' ) }
					</Button>
				</CredentialsForm>
			);
		}

		if ( ! requestedCredentialsSave && statusState === StatusState.Connected ) {
			return (
				<div>
					<Button borderless onClick={ () => setRequestedCredentialsEdit( true ) }>
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
				<h4>{ host }</h4>
				<CredentialsForm handleFormChange={ updateFormState } host={ host } formState={ formState }>
					<Button compact borderless href={ `${ settingsPath( siteSlug ) }` }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Change host' ) }
					</Button>
					<Button primary onClick={ handleUpdateCredentials }>
						{ translate( 'Save credentials' ) }
					</Button>
				</CredentialsForm>
			</div>
		);
	};

	const statusState = getStatusState( backupState );

	return (
		<Main className="advanced-credentials">
			<QueryRewindState siteId={ siteId } poll />
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
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
