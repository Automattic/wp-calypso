/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default class ActivityActor extends PureComponent {
	static propTypes = {
		avatarUrl: PropTypes.string.isRequired,
		displayName: PropTypes.string,
		login: PropTypes.string,
		translatedRole: PropTypes.string.isRequired,
	};

	static defaultProps = {
		avatarUrl: 'https://www.gravatar.com/avatar/0',
		displayName: '',
		login: '',
		translatedRole: '',
	};

	render() {
		const {
			avatarUrl,
			displayName,
			login,
			translatedRole,
		} = this.props;

		return (
			<div className="activity-log-item__actor">
				<Gravatar user={ { avatar_URL: avatarUrl } } size={ 40 } />
				<div className="activity-log-item__actor-info">
					<div className="activity-log-item__actor-name">{ displayName || login }</div>
					<div className="activity-log-item__actor-role">{ translatedRole }</div>
				</div>
			</div>
		);
	}
}
