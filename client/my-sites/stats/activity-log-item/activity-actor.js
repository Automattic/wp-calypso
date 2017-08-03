/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default class ActivityActor extends PureComponent {
	static propTypes = {
		actor: PropTypes.shape( {
			display_name: PropTypes.string,
			login: PropTypes.string,
			translated_role: PropTypes.string,
			avatar_url: PropTypes.string,
		} ),
	};

	render() {
		const { actor } = this.props;
		const avatarUrl = get( actor, 'avatar_url', 'https://www.gravatar.com/avatar/0' );
		const displayName = get( actor, 'display_name', '' );
		const login = get( actor, 'login', '' );
		const translatedRole = get( actor, 'translated_role', '' );

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
