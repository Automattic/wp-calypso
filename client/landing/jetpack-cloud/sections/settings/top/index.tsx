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
import DocumentHead from 'components/data/document-head';
import getRewindState from 'state/selectors/get-rewind-state';
import Main from 'components/main';
import QueryRewindState from 'components/data/query-rewind-state';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	step: number;
}

const SettingsTopLevel: FunctionComponent< Props > = ( { children, step } ) => {
	const translate = useTranslate();

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	const siteId = useSelector( getSelectedSiteId );
	const { state: backupState } = useSelector( ( state ) => getRewindState( state, siteId ) );

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

	return (
		<Main className="top">
			<QueryRewindState siteId={ siteId } />
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card className="top__server-connection-status">
				<div className="top__server-connection-status-content">
					<h3>{ translate( 'Remote server connection credentials' ) }</h3>
					<ConnectionStatus state={ getStatusState( backupState ) } />
				</div>
			</Card>
			<Card>
				<StepProgress currentStep={ step } steps={ steps } />
				{ children }
			</Card>
		</Main>
	);
};

export default SettingsTopLevel;
