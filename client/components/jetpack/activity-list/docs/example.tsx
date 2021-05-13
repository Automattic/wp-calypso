/**
 * External dependencies
 */

import React, { PureComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import ActivityList from '../';
import { LogData } from '../types';

export default class ActivityListExample extends PureComponent {
	static displayName = 'ActivityList';

	render(): ReactNode {
		const logs: LogData = {
			state: 'success',
			data: [
				{
					activityDate: '',
					activityDescription: [],
					activityId: 'test',
					activityName: '',
					activityStatus: 'success',
					activityTitle: 'Backup complete',
				},
			],
		};

		return (
			<div>
				<ActivityList logs={ logs } />
			</div>
		);
	}
}
