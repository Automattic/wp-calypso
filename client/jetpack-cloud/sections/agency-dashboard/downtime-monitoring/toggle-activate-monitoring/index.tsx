import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useToggleActivateMonitor } from '../../hooks';
import type { AllowedStatusTypes } from '../../sites-overview/types';

import './style.scss';

interface Props {
	site: { blog_id: number; url: string };
	status: AllowedStatusTypes | string;
}

export default function ToggleActivateMonitoring( { site, status }: Props ) {
	const ToggleControl = OriginalToggleControl as React.ComponentType<
		OriginalToggleControl.Props & {
			disabled?: boolean;
		}
	>;

	const [ toggleActivateMonitor, isLoading ] = useToggleActivateMonitor( site );

	function handleToggleActivateMonitoring( checked: boolean ) {
		toggleActivateMonitor( checked );
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
