import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useUpdateMonitorSettings } from '../../hooks';
import type { AllowedStatusTypes } from '../../sites-overview/types';

import './style.scss';

interface Props {
	siteId: number;
	status: AllowedStatusTypes | string;
}

export default function ToggleActivateMonitoring( { siteId, status }: Props ) {
	const ToggleControl = OriginalToggleControl as React.ComponentType<
		OriginalToggleControl.Props & {
			disabled?: boolean;
		}
	>;

	const [ updateMonitorSettings, isLoading ] = useUpdateMonitorSettings( siteId );

	function handleToggleActivateMonitoring( checked: boolean ) {
		updateMonitorSettings( { monitor_active: checked } );
	}

	const isChecked = status !== 'disabled';

	return (
		<span className="toggle-activate-monitoring__toggle-button">
			<ToggleControl
				onChange={ handleToggleActivateMonitoring }
				checked={ isChecked }
				disabled={ isLoading }
			/>
		</span>
	);
}
