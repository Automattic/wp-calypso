import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, createRef, useContext } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import SelectDropdown from 'calypso/components/select-dropdown';
import NotificationSettings from '../downtime-monitoring/notification-settings';
import SitesOverviewContext from '../sites-overview/context';
import {
	useHandleToggleMonitor,
	useHandleResetNotification,
	useHandleShowHideActionBar,
} from './hooks';
import type { Site } from '../sites-overview/types';

import './style.scss';

// Constants help determine if the action bar should be a dropdown

interface Props {
	selectedSites: Array< Site >;
	monitorUserEmails: Array< string >;
}

export default function DashboardBulkActions( { selectedSites, monitorUserEmails }: Props ) {
	const actionBarRef = createRef< HTMLDivElement >();
	const translate = useTranslate();
	const { setIsBulkManagementActive } = useContext( SitesOverviewContext );

	const handleToggleActivateMonitor = useHandleToggleMonitor( selectedSites );
	const handleResetNotification = useHandleResetNotification( selectedSites );
	const { actionBarVisible } = useHandleShowHideActionBar( actionBarRef );

	const [ showNotificationSettingsPopup, setShowNotificationSettingsPopup ] = useState( false );

	function toggleNotificationSettingsPopup() {
		setShowNotificationSettingsPopup( ( isOpen ) => ! isOpen );
	}

	const toggleMonitorActions = [
		{
			label: translate( 'Pause Monitor' ),
			action: () => handleToggleActivateMonitor( false ),
		},
		{
			label: translate( 'Resume Monitor' ),
			action: () => handleToggleActivateMonitor( true ),
		},
	];

	const otherMonitorActions = [
		{
			label: translate( 'Custom Notification' ),
			action: () => toggleNotificationSettingsPopup(),
		},
		{
			label: translate( 'Reset Notification' ),
			action: () => handleResetNotification(),
		},
	];

	const disabled = selectedSites.length === 0;

	const desktopContent = (
		<>
			<ButtonGroup>
				{ toggleMonitorActions.map( ( { label, action } ) => (
					<Button compact key={ label } disabled={ disabled } onClick={ action }>
						{ label }
					</Button>
				) ) }
			</ButtonGroup>
			{ otherMonitorActions.map( ( { label, action } ) => (
				<ButtonGroup key={ label }>
					<Button compact disabled={ disabled } onClick={ action }>
						{ label }
					</Button>
				</ButtonGroup>
			) ) }
		</>
	);

	const mobileContent = (
		<SelectDropdown compact selectedText={ translate( 'Actions' ) }>
			{ [ ...toggleMonitorActions, ...otherMonitorActions ].map( ( { label, action } ) => (
				<SelectDropdown.Item key={ label } disabled={ disabled } onClick={ action }>
					{ label }
				</SelectDropdown.Item>
			) ) }
		</SelectDropdown>
	);

	return (
		<>
			<div
				ref={ actionBarRef }
				className={ classNames( 'dashboard-bulk-actions', {
					'dashboard-bulk-actions__is-action-bar-visible': actionBarVisible,
				} ) }
			>
				<div className="dashboard-bulk-actions__content">
					<div className="dashboard-bulk-actions__large-screen">{ desktopContent }</div>
					<div className="dashboard-bulk-actions__small-screen">{ mobileContent }</div>
				</div>
				<ButtonGroup>
					<Button compact borderless className="dashboard-bulk-actions__close-icon">
						<Gridicon icon="cross" onClick={ () => setIsBulkManagementActive( false ) } />
					</Button>
				</ButtonGroup>
			</div>
			{ showNotificationSettingsPopup && (
				<NotificationSettings
					monitorUserEmails={ monitorUserEmails }
					sites={ selectedSites }
					onClose={ toggleNotificationSettingsPopup }
				/>
			) }
		</>
	);
}
