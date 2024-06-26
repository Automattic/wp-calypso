import page from '@automattic/calypso-router';
import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useMemo, useState, useEffect } from 'react';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import StepProgress from 'calypso/components/step-progress';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useSelector, useDispatch } from 'calypso/state';
import { JETPACK_CREDENTIALS_UPDATE_RESET } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	deleteCredentials,
	updateCredentials,
	testCredentials,
} from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getJetpackCredentialsTestStatus from 'calypso/state/selectors/get-jetpack-credentials-test-status';
import getJetpackCredentialsUpdateError from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ConnectionStatus, StatusState } from './connection-status';
import CredentialsForm from './credentials-form';
import { FormMode, FormState, INITIAL_FORM_ERRORS, INITIAL_FORM_STATE, validate } from './form';
import HostSelection from './host-selection';
import { getHostInput } from './utils';
import Verification from './verification';
import './style.scss';
import type { ClickHandler } from 'calypso/components/step-progress';

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
	onFinishCallback?: () => void;
	redirectOnFinish?: boolean;
	goBackPath?: string;
}

const AdvancedCredentials: FunctionComponent< Props > = ( {
	action,
	host,
	role,
	onFinishCallback = null,
	redirectOnFinish = true,
	goBackPath = '',
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isAlternate = role === 'alternate';

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const steps = [
		{
			message: translate( 'Host locator' ),
			onClick: () => page( settingsPath( siteSlug as string ) ),
			show: 'onComplete',
		} as ClickHandler,
		translate( 'Credentials' ),
		translate( 'Verification' ),
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

	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, siteId, role )
	) as FormState & { abspath: string };

	const [ testCredentialsLoading, setTestCredentialsLoading ] = useState( true );
	const [ testCredentialsResult, setTestCredentialsResult ] = useState( false );

	// Don't test credentials or pre-load the formState if we're editing alternate credentials
	const hasCredentials = ! isAlternate && credentials && Object.keys( credentials ).length > 0;

	const { protocol } = credentials;
	const isAtomic = hasCredentials && 'dynamic-ssh' === protocol;

	const credentialsTestStatus = useSelector( ( state ) =>
		getJetpackCredentialsTestStatus( state, siteId, role )
	);

	const isRequestingCredentials = useSelector(
		( state ) => isRequestingSiteCredentials( state, siteId as number ) || testCredentialsLoading
	);

	useEffect( () => {
		if ( hasCredentials ) {
			dispatch( testCredentials( siteId, role ) );
		}
	}, [ dispatch, hasCredentials, role, siteId ] );

	useEffect(
		function () {
			// If we're not testing credentials, we're done loading
			if ( 'pending' !== credentialsTestStatus || ! hasCredentials ) {
				setTestCredentialsLoading( false );
			}

			if ( 'valid' === credentialsTestStatus ) {
				setTestCredentialsResult( true );
			}

			if ( 'invalid' === credentialsTestStatus ) {
				setTestCredentialsResult( false );
			}
		},
		[ credentialsTestStatus, hasCredentials ]
	);

	const statusState = useMemo( (): StatusState => {
		if ( isRequestingCredentials ) {
			return StatusState.Loading;
		}

		if ( hasCredentials && testCredentialsResult ) {
			return StatusState.Connected;
		}

		return StatusState.Disconnected;
	}, [ hasCredentials, testCredentialsResult, isRequestingCredentials ] );

	const currentStep = useMemo( (): Step => {
		if ( 'unsubmitted' !== formSubmissionStatus ) {
			return Step.Verification;
		} else if ( statusState === StatusState.Connected ) {
			return 'edit' === action && ! isAtomic ? Step.ConnectedEdit : Step.Connected;
		} else if ( undefined === host ) {
			return Step.HostSelection;
		}
		return Step.Credentials;
	}, [ action, formSubmissionStatus, host, isAtomic, statusState ] );

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
			switch ( formSubmissionError.wpcomError?.code ) {
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

	const disableForm = 'pending' === formSubmissionStatus;
	const formHasErrors = formErrors && Object.keys( formErrors ).length > 0;

	const handleDeleteCredentials = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_delete' ) );
		dispatch( deleteCredentials( siteId, role ) );

		setFormState( INITIAL_FORM_STATE );
		setFormMode( FormMode.Password );
		setFormErrors( INITIAL_FORM_ERRORS );
	};

	const handleUpdateCredentials = useCallback( () => {
		if ( formHasErrors ) {
			return;
		}

		const credentials = { ...formState };

		if ( formMode === FormMode.Password ) {
			credentials.kpri = '';
		} else if ( formMode === FormMode.PrivateKey ) {
			credentials.pass = '';
		}

		const host = getHostInput( formState.host );
		if ( host ) {
			credentials.host = host;
		}

		if ( formState.save_as_staging ) {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_save_staging' )
			);
		}

		dispatch( recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_credentials_update' ) );
		dispatch( updateCredentials( siteId, credentials, true, false ) );
	}, [ formHasErrors, dispatch, siteId, formState, formMode ] );

	const renderUnconnectedButtons = () => (
		<>
			{ ! isAlternate && (
				<Button
					compact
					borderless
					disabled={ disableForm }
					href={ settingsPath( siteSlug ) }
					onClick={ () => {
						dispatch(
							recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_switch_host', { host } )
						);
					} }
				>
					<Gridicon icon="arrow-left" size={ 18 } />
					{ translate( 'Change host' ) }
				</Button>
			) }
			{ isAlternate && goBackPath !== '' && (
				<Button
					disabled={ disableForm }
					href={ goBackPath }
					onClick={ () => {
						dispatch( recordTracksEvent( 'calypso_jetpack_advanced_credentials_go_back' ) );
					} }
				>
					{ translate( 'Go back' ) }
				</Button>
			) }
			<Button primary onClick={ handleUpdateCredentials } disabled={ disableForm || formHasErrors }>
				{ isAlternate && ! formState.save_as_staging
					? translate( 'Confirm credentials' )
					: translate( 'Test and save credentials' ) }
			</Button>
		</>
	);

	const renderConnectedButtons = () => (
		<>
			<Button scary disabled={ disableForm } onClick={ handleDeleteCredentials }>
				{ translate( 'Delete credentials' ) }
			</Button>
			<Button onClick={ handleUpdateCredentials } disabled={ disableForm || formHasErrors }>
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
			role={ role }
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
						onFinishUp={
							onFinishCallback
								? onFinishCallback
								: () => {
										dispatch( {
											type: JETPACK_CREDENTIALS_UPDATE_RESET,
											siteId,
										} );
								  }
						}
						onReview={ () => {
							dispatch( {
								type: JETPACK_CREDENTIALS_UPDATE_RESET,
								siteId,
							} );
						} }
						redirectOnFinish={ redirectOnFinish }
						targetSite={ formState.site_url ?? null }
					/>
				);
			case Step.Connected:
				return (
					<div>
						{ isAtomic ? (
							translate(
								'The remote server credentials for %(siteSlug)s are present and correct, allowing Jetpack to perform restores and security fixes when required.',
								{
									args: {
										siteSlug,
									},
								}
							)
						) : (
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
						) }
					</div>
				);
			case Step.ConnectedEdit:
				return renderCredentialsForm( true );
		}
	};

	return (
		<div className={ `advanced-credentials ${ isAlternate ? 'alternate' : '' }` }>
			<QuerySiteCredentials siteId={ siteId } />
			<PageViewTracker
				path={ settingsPath( ':site' ) }
				title="Advanced Credentials"
				properties={ { step: currentStep } }
			/>
			<Card compact className="advanced-credentials__server-connection-status">
				<div className="advanced-credentials__server-connection-status-content">
					<h3>{ translate( 'Remote server credentials' ) }</h3>
					<ConnectionStatus state={ statusState } />
				</div>
			</Card>
			<Card>
				{ startedWithoutConnection && <StepProgress currentStep={ currentStep } steps={ steps } /> }
				{ render() }
			</Card>
		</div>
	);
};

export default AdvancedCredentials;
