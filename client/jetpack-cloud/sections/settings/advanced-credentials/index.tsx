/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { ConnectionStatus, StatusState } from './connection-status';
import { getSelectedSiteId } from 'state/ui/selectors';
import CredentialsForm from './credentials-form';
import DocumentHead from 'components/data/document-head';
import getRewindState from 'state/selectors/get-rewind-state';
import HostSelection from './host-selection';
import Main from 'components/main';
import QueryRewindState from 'components/data/query-rewind-state';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';
import Verfication from './verification';

/**
 * Style dependencies
 */
import './style.scss';

enum Steps {
	HostSelectionStep = 0,
	CredentialsStep = 1,
	VerificationStep = 2,
}

const AdvancedCredentials: FunctionComponent = () => {
	const translate = useTranslate();

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	const siteId = useSelector( getSelectedSiteId );
	const [ currentStep, setCurrentStep ] = useState( Steps.HostSelectionStep );
	const [ selectedHost, setSelectedHost ] = useState< null | string >( null );
	const { state: backupState } = useSelector( ( state ) => getRewindState( state, siteId ) ) as {
		state: string;
	};

	const changeHost = ( newHost: string | null ) => {
		setSelectedHost( newHost );
		setCurrentStep( Steps.CredentialsStep );
	};

	const switchToConnectionStep = () => {
		setCurrentStep( Steps.VerificationStep );
	};

	const switchToCredentialsStep = () => {
		setCurrentStep( Steps.CredentialsStep );
	};

	const getStatusState = ( currentBackupState: string ): StatusState => {
		switch ( currentBackupState ) {
			case 'uninitialized':
				return StatusState.Loading;
			case 'active':
				return StatusState.Connected;
			case 'inactive':
			case 'awaiting_credentials':
			case 'unavailable':
			default:
				return StatusState.Disconnected;
		}
	};

	const renderStep = ( step: Steps ) => {
		switch ( step ) {
			case Steps.VerificationStep:
				return <Verfication onReviewCredentialsClick={ switchToCredentialsStep } />;
			case Steps.CredentialsStep:
				return (
					<div>
						<h4>{ selectedHost }</h4>
						<CredentialsForm onCredentialsSave={ switchToConnectionStep } />
					</div>
				);
			case Steps.HostSelectionStep:
				return <HostSelection onHostChange={ changeHost } />;
		}
	};

	return (
		<Main className="advanced-credentials">
			<QueryRewindState siteId={ siteId } />
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card className="advanced-credentials__server-connection-status">
				<div className="advanced-credentials__server-connection-status-content">
					<h3>{ translate( 'Remote server credentials' ) }</h3>
					<ConnectionStatus state={ getStatusState( backupState ) } />
				</div>
			</Card>
			<Card>
				<StepProgress currentStep={ currentStep } steps={ steps } />
				{ renderStep( currentStep ) }
			</Card>
		</Main>
	);
};

export default AdvancedCredentials;
