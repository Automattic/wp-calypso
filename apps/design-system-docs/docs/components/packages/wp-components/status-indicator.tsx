import { Tooltip } from '@wordpress/components';
import { ComponentStatus, statuses } from './data';
import styles from './style.module.scss';

export const StatusIndicator = ( { status }: { status: ComponentStatus } ) => {
	return (
		<Tooltip text={ statuses.find( ( s ) => s.value === status )?.label }>
			<div
				className={ styles[ 'status-indicator' ] }
				aria-label={ statuses.find( ( s ) => s.value === status )?.label }
			>
				{ statuses.find( ( s ) => s.value === status )?.icon }
			</div>
		</Tooltip>
	);
};
