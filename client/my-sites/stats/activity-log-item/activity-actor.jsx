/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default class ActivityActor extends PureComponent {
	static propTypes = {
		actor: PropTypes.shape( {
			actorAvatarUrl: PropTypes.string,
			actorName: PropTypes.string,
			actorRole: PropTypes.string,
		} ),
	};

	render() {
		const { actorAvatarUrl, actorName, actorRole } = this.props;

		return (
			<div className="activity-log-item__actor">
				<Gravatar user={ { avatar_URL: actorAvatarUrl } } size={ 40 } />
				<div className="activity-log-item__actor-info">
					<div className="activity-log-item__actor-name">
						{ actorName }
					</div>
					<div className="activity-log-item__actor-role">
						{ actorRole }
					</div>
				</div>
			</div>
		);
	}
}
