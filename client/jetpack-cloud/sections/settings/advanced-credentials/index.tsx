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
import DocumentHead from 'components/data/document-head';
import getRewindState from 'state/selectors/get-rewind-state';
import HostSelection from './host-selection';
import Main from 'components/main';
import QueryRewindState from 'components/data/query-rewind-state';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';

/**
 * Style dependencies
 */
import './style.scss';

const AdvancedCredentials: FunctionComponent = () => {
	const translate = useTranslate();

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	const siteId = useSelector( getSelectedSiteId );
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ selectedHost, setSelectedHost ] = useState< null | string >( null );
	const { state: backupState } = useSelector( ( state ) => getRewindState( state, siteId ) );

	const changeHost = ( newHost: string | null ) => setSelectedHost( newHost );

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

	const renderStep = ( step: number ) => {
		switch ( step ) {
			case 0:
				return <HostSelection onHostChange={ changeHost } />;
		}
	};

	return (
		<Main className="top">
			<QueryRewindState siteId={ siteId } />
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card className="top__server-connection-status">
				<div className="top__server-connection-status-content">
					<h3>{ translate( 'Remote server connection credentials' ) }</h3>
					<h4>{ selectedHost }</h4>
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
