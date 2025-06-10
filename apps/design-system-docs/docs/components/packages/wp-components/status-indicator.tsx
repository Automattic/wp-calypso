import { Tooltip } from '@wordpress/components';
import { ComponentStatus, statuses } from './data';
import styles from './status-indicator.module.scss';

export const StatusIndicator = ( { status }: { status: ComponentStatus } ) => {
	const { label, icon } = statuses.find( ( s ) => s.value === status ) ?? {};

	return (
		<Tooltip text={ label }>
			<div className={ styles[ 'status-indicator' ] } aria-label={ label }>
				{ icon }
			</div>
		</Tooltip>
	);
};
