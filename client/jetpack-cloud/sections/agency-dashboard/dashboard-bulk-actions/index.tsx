import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import SelectDropdown from 'calypso/components/select-dropdown';
import NotificationSettings from '../downtime-monitoring/notification-settings';
import { useHandleToggleMonitor, useHandleResetNotification } from './hooks';
import type { Site } from '../sites-overview/types';

import './style.scss';

interface Props {
	selectedSites: Array< Site >;
}

export default function DashboardBulkActions( { selectedSites }: Props ) {
	const translate = useTranslate();

	const isMobile = useMobileBreakpoint();

	const handleToggleActivateMonitor = useHandleToggleMonitor( selectedSites );
	const handleResetNotification = useHandleResetNotification( selectedSites );

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

	let content = null;
	const disabled = selectedSites.length === 0;

	if ( ! isMobile ) {
		content = (
			<>
				<ButtonGroup>
					{ toggleMonitorActions.map( ( { label, action } ) => (
						<Button key={ label } disabled={ disabled } onClick={ action }>
							{ label }
						</Button>
					) ) }
				</ButtonGroup>
				{ otherMonitorActions.map( ( { label, action } ) => (
					<ButtonGroup key={ label }>
						<Button disabled={ disabled } onClick={ action }>
							{ label }
						</Button>
					</ButtonGroup>
				) ) }
			</>
		);
	} else {
		content = (
			<SelectDropdown compact selectedText={ translate( 'Actions' ) }>
				{ [ ...toggleMonitorActions, ...otherMonitorActions ].map( ( { label, action } ) => (
					<SelectDropdown.Item key={ label } disabled={ disabled } onClick={ action }>
						{ label }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
		);
	}

	return (
		<>
			<div className="dashboard-bulk-actions">{ content }</div>
			{ showNotificationSettingsPopup && (
				<NotificationSettings sites={ selectedSites } onClose={ toggleNotificationSettingsPopup } />
			) }
		</>
	);
}
