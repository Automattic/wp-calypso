/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { FunctionComponent, useMemo, useState, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { ConnectionStatus, StatusState } from './connection-status';
import { FormMode, FormState, INITIAL_FORM_ERRORS, INITIAL_FORM_STATE, validate } from './form';
import Verification from './verification';
import { deleteCredentials, updateCredentials } from 'calypso/state/jetpack/credentials/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import CredentialsForm from './credentials-form';
import DocumentHead from 'calypso/components/data/document-head';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getJetpackCredentialsUpdateError from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import Gridicon from 'calypso/components/gridicon';
import HostSelection from './host-selection';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import StepProgress from 'calypso/components/step-progress';

/**
 * Style dependencies
 */
import './style.scss';

enum Step {
	HostSelection = 0,
	Credentials = 1,
	Verification = 2,
	Connected = 3,
	ConnectedEdit = 4,
}

interface Props {
	action?: string;
	host?: string;
	role: string;
}

const AdvancedCredentials: FunctionComponent< Props > = ( { action, host, role } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const steps = [
		{
			message: translate( 'Host locator' ),
			onClick: () => page( settingsPath( siteSlug as string ) ),
			show: 'onComplete',
		},
		translate( 'Credentials' ),
		translate( 'Saved' ),
		// TODO: moved Verification to future work
		// translate( 'Verification' ),
		translate( 'Connected' ),
	];

	const [ formState, setFormState ] = useState( INITIAL_FORM_STATE );
	const [ formErrors, setFormErrors ] = useState( INITIAL_FORM_ERRORS );
	const [ formMode, setFormMode ] = useState( FormMode.Password );
	const [ startedWithoutConnection, setStartedWithoutConnection ] = useState( false );

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

	const isRequestingCredentials = useSelector( ( state ) =>
		isRequestingSiteCredentials( state, siteId as number )
	);

	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, siteId, role )
	) as FormState & { abspath: string };

	const hasCredentials = ! isEmpty( credentials );

	const statusState = useMemo( (): StatusState => {
		if ( isRequestingCredentials ) {
			return StatusState.Loading;
		}

		if ( hasCredentials ) {
			return StatusState.Connected;
		}

		return StatusState.Disconnected;
	}, [ hasCredentials, isRequestingCredentials ] );

	const currentStep = useMemo( (): Step => {
		if ( 'pending' === formSubmissionStatus ) {
			return Step.Verification;
		} else if ( statusState === StatusState.Connected ) {
			return 'edit' === action ? Step.ConnectedEdit : Step.Connected;
		} else if ( undefined === host ) {
			return Step.HostSelection;
		}
		return Step.Credentials;
	}, [ action, formSubmissionStatus, host, statusState ] );

	// suppress the step progress until we are disconnected
	useEffect( () => {
		if ( statusState === StatusState.Disconnected ) {
			setStartedWithoutConnection( true );
		}
	}, [ setStartedWithoutConnection, statusState ] );

	// when credentials load, merge w/ the form state
	useEffect( () => {
		if ( hasCredentials ) {
			const { abspath, path, ...otherProperties } = credentials;
			setFormState( { ...otherProperties, path: abspath || path, pass: '', kpri: '' } );
		}
	}, [ credentials, hasCredentials ] );

	// validate changes to the credentials form
	useEffect( () => {
		setFormErrors( validate( formState, formMode ) );
	}, [ formState, formMode ] );

	// handle responses from the form submission
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

	// reset form information on siteId change
	useEffect( () => {
		setFormState( INITIAL_FORM_STATE );
		setFormMode( FormMode.Password );
	}, [ siteId, setFormState ] );

	// record tracks events on each new step of process
	useEffect( () => {
		switch ( currentStep ) {
			case Step.HostSelection:
				dispatch(
					recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_host_selection_step_enter' )
				);
				break;
			case Step.Credentials:
				dispatch(
					recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_step_enter', {
						host,
					} )
				);
				break;
			case Step.Verification:
				dispatch(
					recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_verification_step_enter', {
						host,
					} )
				);
				break;
			case Step.Connected:
				dispatch(
					recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_connected_step_enter' )
				);
				break;
			case Step.ConnectedEdit:
				dispatch(
					recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_connected_edit_step_enter' )
				);
				break;
		}
	}, [ currentStep, dispatch, host ] );

	const handleDeleteCredentials = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_delete' ) );

		dispatch( deleteCredentials( siteId, role ) );
	};

	const handleUpdateCredentials = () => {
		if ( ! isEmpty( formErrors ) ) {
			return;
		}
		dispatch( recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_update' ) );
		dispatch( updateCredentials( siteId, { role, ...formState }, true, false ) );
	};

	const disableForm = 'pending' === formSubmissionStatus;

	const renderUnconnectedButtons = () => (
		<>
			<Button
				compact
				borderless
				disabled={ disableForm }
				href={ settingsPath( siteSlug ?? undefined ) }
				onClick={ () => {
					dispatch(
						recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_switch_host', { host } )
					);
				} }
			>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Change host' ) }
			</Button>
			<Button
				primary
				onClick={ handleUpdateCredentials }
				disabled={ ! isEmpty( formErrors ) || disableForm }
			>
				{ translate( 'Test and save credentials' ) }
			</Button>
		</>
	);

	const renderConnectedButtons = () => (
		<>
			<Button scary disabled={ disableForm } onClick={ handleDeleteCredentials }>
				{ translate( 'Delete Credentials' ) }
			</Button>
			<Button
				onClick={ handleUpdateCredentials }
				disabled={ ! isEmpty( formErrors ) || disableForm }
			>
				{ translate( 'Update credentials' ) }
			</Button>
		</>
	);

	const renderCredentialsForm = ( connected: boolean ) => (
		<CredentialsForm
			disabled={ disableForm }
			formErrors={ formErrors }
			formMode={ formMode }
			formState={ formState }
			host={ host ?? 'generic' }
			onFormStateChange={ setFormState }
			onModeChange={ setFormMode }
		>
			{ connected ? renderConnectedButtons() : renderUnconnectedButtons() }
		</CredentialsForm>
	);

	const render = () => {
		if ( ! siteSlug || statusState === StatusState.Loading ) {
			// TODO:, placeholder
			return <div></div>;
		}

		switch ( currentStep ) {
			case Step.HostSelection:
				return <HostSelection />;
			case Step.Credentials:
				return renderCredentialsForm( false );
			case Step.Verification:
				return (
					<Verification
						formSubmissionError={ formSubmissionError }
						formSubmissionStatus={ formSubmissionStatus }
						onFinishUp={ () => {
							/* TODO @azabani */
						} }
					/>
				);
			case Step.Connected:
				return (
					<div>
						<Button
							borderless
							className="advanced-credentials__connected"
							href={ `${ settingsPath( siteSlug ) }?action=edit` }
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
			case Step.ConnectedEdit:
				return renderCredentialsForm( true );
		}
	};

	return (
		<Main className="advanced-credentials">
			<QuerySiteCredentials siteId={ siteId } />
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<PageViewTracker
				path={ settingsPath( ':site' ) }
				title="Advanced Credentials"
				properties={ { step: currentStep } }
			/>
			<Card compact={ true } className="advanced-credentials__server-connection-status">
				<div className="advanced-credentials__server-connection-status-content">
					<h3>{ translate( 'Remote server credentials' ) }</h3>
					<ConnectionStatus state={ statusState } />
				</div>
			</Card>
			<Card>
				{ startedWithoutConnection && <StepProgress currentStep={ currentStep } steps={ steps } /> }
				{ render() }
			</Card>
		</Main>
	);
};

export default AdvancedCredentials;
