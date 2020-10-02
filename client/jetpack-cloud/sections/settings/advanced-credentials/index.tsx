/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

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

/**
 * Style dependencies
 */
import './style.scss';
interface Props {
	host?: string;
}

const AdvancedCredentials: FunctionComponent< Props > = ( { host } ) => {
	const translate = useTranslate();

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	const siteId = useSelector( getSelectedSiteId );
	const { state: backupState } = useSelector( ( state ) => getRewindState( state, siteId ) ) as {
		state: string;
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

	const getCurrentStep = () => {
		if ( host === undefined ) {
			return 0;
		}
		return 1;
	};

	const render = () => {
		if ( host === undefined ) {
			return <HostSelection />;
		}
		return (
			<div>
				<h4>{ host }</h4>
				<CredentialsForm host={ host } />
			</div>
		);
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
				<StepProgress currentStep={ getCurrentStep() } steps={ steps } />
				{ render() }
			</Card>
		</Main>
	);
};

export default AdvancedCredentials;
