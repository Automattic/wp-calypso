import { Icon, check, closeSmall, rotateRight } from '@wordpress/icons';
import clsx from 'clsx';
import type { ScheduleUpdates } from 'calypso/data/plugins/use-update-schedules-query';

import './badge.scss';

interface Props {
	type: ScheduleUpdates[ 'last_run_status' ];
}
export const Badge = ( props: Props ) => {
	const { type } = props;

	const className = clsx( 'badge-component', {
		'badge-component--failed':
			type === 'failure-and-rollback' || type === 'failure' || type === 'failure-and-rollback-fail',
		'badge-component--in-progress': type === 'in-progress',
		'badge-component--success': type === 'success',
	} );

	return (
		<span className={ className }>
			{ type === 'in-progress' && <Icon icon={ rotateRight } size={ 20 } /> }
			{ type === 'success' && <Icon icon={ check } size={ 20 } /> }
			{ type === 'failure-and-rollback' ||
			type === 'failure-and-rollback-fail' ||
			type === 'failure' ? (
				<Icon icon={ closeSmall } size={ 20 } />
			) : null }
		</span>
	);
};
