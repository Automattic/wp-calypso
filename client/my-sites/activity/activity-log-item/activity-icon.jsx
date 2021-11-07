import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

export default class ActivityIcon extends PureComponent {
	static propTypes = {
		activityIcon: PropTypes.string.isRequired,
		activityStatus: PropTypes.string,
	};

	render() {
		const { activityIcon, activityStatus } = this.props;
		const classes = classNames(
			'activity-log-item__activity-icon',
			activityStatus && `is-${ activityStatus }`
		);

		return (
			<div className={ classes }>
				<Gridicon icon={ activityIcon } size={ 24 } />
			</div>
		);
	}
}
