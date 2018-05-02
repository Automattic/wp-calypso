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
import JetpackLogo from 'components/jetpack-logo';

/**
 * Module constants
 */
const JETPACK_ACTOR = (
	<div className="activity-log-item__actor">
		<JetpackLogo size={ 40 } />
		<div className="activity-log-item__actor-info">
			<div className="activity-log-item__actor-name">Jetpack</div>
		</div>
	</div>
);

const HAPPINESS_ACTOR = (
	<div className="activity-log-item__actor">
		<JetpackLogo size={ 40 } />
		<div className="activity-log-item__actor-info">
			<div className="activity-log-item__actor-name">Happiness Engineer</div>
		</div>
	</div>
);

export default class ActivityActor extends PureComponent {
	static propTypes = {
		actor: PropTypes.shape( {
			actorAvatarUrl: PropTypes.string,
			actorName: PropTypes.string,
			actorRole: PropTypes.string,
			actorType: PropTypes.string,
		} ),
	};

	render() {
		const { actorAvatarUrl, actorName, actorRole, actorType } = this.props;

		if ( actorName === 'Jetpack' && actorType === 'Application' ) {
			return JETPACK_ACTOR;
		}

		if ( actorName === 'Happiness Engineer' && actorType === 'Happiness Engineer' ) {
			return HAPPINESS_ACTOR;
		}

		return (
			<div className="activity-log-item__actor">
				<Gravatar user={ { avatar_URL: actorAvatarUrl } } size={ 40 } />
				<div className="activity-log-item__actor-info">
					<div className="activity-log-item__actor-name">{ actorName }</div>
					{ actorRole && <div className="activity-log-item__actor-role">{ actorRole }</div> }
				</div>
			</div>
		);
	}
}
