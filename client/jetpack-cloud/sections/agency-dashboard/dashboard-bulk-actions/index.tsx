import { Button, Gridicon, SelectDropdown } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { createRef, useContext } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import NotificationSettings from '../downtime-monitoring/notification-settings';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../hooks';
import SitesOverviewContext from '../sites-overview/context';
import {
	useHandleToggleMonitor,
	useHandleResetNotification,
	useHandleShowHideActionBar,
} from './hooks';
import type { Site, MonitorSettings } from '../sites-overview/types';

import './style.scss';

// Constants help determine if the action bar should be a dropdown

interface Props {
	selectedSites: Array< Site >;
	bulkUpdateSettings?: MonitorSettings;
	isLargeScreen?: boolean;
}

export default function DashboardBulkActions( {
	selectedSites,
	bulkUpdateSettings,
	isLargeScreen,
}: Props ) {
	const actionBarRef = createRef< HTMLDivElement >();
	const translate = useTranslate();
	const { setIsBulkManagementActive, setIsPopoverOpen, isPopoverOpen } =
		useContext( SitesOverviewContext );

	const handleToggleActivateMonitor = useHandleToggleMonitor( selectedSites, isLargeScreen );
	const handleResetNotification = useHandleResetNotification( selectedSites, isLargeScreen );
	const { actionBarVisible } = useHandleShowHideActionBar( actionBarRef );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( selectedSites, isLargeScreen );

	function toggleNotificationSettingsPopup() {
		setIsPopoverOpen( ( isPopoverOpen ) => ! isPopoverOpen );
	}

	const toggleMonitorActions = [
		{
			label: translate( 'Pause Monitor' ),
			action: () => handleToggleActivateMonitor( false ),
			actionName: 'pause_monitor_click',
		},
		{
			label: translate( 'Resume Monitor' ),
			action: () => handleToggleActivateMonitor( true ),
			actionName: 'resume_monitor_click',
		},
	];

	const otherMonitorActions = [
		{
			label: translate( 'Custom Notification' ),
			action: () => toggleNotificationSettingsPopup(),
			actionName: 'custom_notification_click',
			className: 'dashboard-bulk-actions__custom_notification_button',
		},
		{
			label: translate( 'Reset Notification' ),
			action: () => handleResetNotification(),
			actionName: 'reset_notification_click',
			className: 'dashboard-bulk-actions__reset_notification_button',
		},
	];

	const disabled = selectedSites.length === 0;

	const handleAction = ( action: () => void, actionName: string ) => {
		recordEvent( actionName );
		action();
	};

	const desktopContent = (
		<>
			<ButtonGroup>
				{ toggleMonitorActions.map( ( { label, action, actionName } ) => (
					<Button
						compact
						key={ label }
						disabled={ disabled }
						onClick={ () => handleAction( action, actionName ) }
					>
						{ label }
					</Button>
				) ) }
			</ButtonGroup>
			{ otherMonitorActions.map( ( { label, action, actionName, className } ) => (
				<ButtonGroup key={ label }>
					<Button
						compact
						disabled={ disabled }
						onClick={ () => handleAction( action, actionName ) }
						className={ className }
					>
						{ label }
					</Button>
				</ButtonGroup>
			) ) }
		</>
	);

	const mobileContent = (
		<SelectDropdown compact selectedText={ translate( 'Actions' ) }>
			{ [ ...toggleMonitorActions, ...otherMonitorActions ].map(
				( { label, action, actionName } ) => (
					<SelectDropdown.Item
						key={ label }
						disabled={ disabled }
						onClick={ () => handleAction( action, actionName ) }
					>
						{ label }
					</SelectDropdown.Item>
				)
			) }
		</SelectDropdown>
	);

	return (
		<>
			<div
				ref={ actionBarRef }
				className={ clsx( 'dashboard-bulk-actions', {
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
			{ isPopoverOpen && (
				<NotificationSettings
					sites={ selectedSites }
					bulkUpdateSettings={ bulkUpdateSettings }
					onClose={ toggleNotificationSettingsPopup }
					isLargeScreen={ isLargeScreen }
				/>
			) }
		</>
	);
}
