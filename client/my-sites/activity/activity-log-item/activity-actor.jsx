import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import Gravatar from 'calypso/components/gravatar';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SocialLogo from 'calypso/components/social-logo';
import ActivityActorIcon from './activity-actor-icon';

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

const JETPACK_BOOST_ACTOR = (
	<div className="activity-log-item__actor">
		<JetpackLogo size={ 40 } />
		<div className="activity-log-item__actor-info">
			<div className="activity-log-item__actor-name">Jetpack Boost</div>
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

const SERVER_ACTOR = (
	<div className="activity-log-item__actor activity-log-item__server-actor">
		<svg
			className="server-actor-icon"
			width="40"
			height="40"
			viewBox="0 0 40 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="20" cy="20" r="20" />
			<path
				d="M15.175 14.0754C14.825 14.0754 14.5292 14.1962 14.2875 14.4379C14.0458 14.6796 13.925 14.9754 13.925 15.3254C13.925 15.6754 14.0458 15.9712 14.2875 16.2129C14.5292 16.4546 14.825 16.5754 15.175 16.5754C15.525 16.5754 15.8208 16.4546 16.0625 16.2129C16.3042 15.9712 16.425 15.6754 16.425 15.3254C16.425 14.9754 16.3042 14.6796 16.0625 14.4379C15.8208 14.1962 15.525 14.0754 15.175 14.0754ZM15.175 24.4254C14.825 24.4254 14.5292 24.5462 14.2875 24.7879C14.0458 25.0296 13.925 25.3254 13.925 25.6754C13.925 26.0254 14.0458 26.3212 14.2875 26.5629C14.5292 26.8046 14.825 26.9254 15.175 26.9254C15.525 26.9254 15.8208 26.8046 16.0625 26.5629C16.3042 26.3212 16.425 26.0254 16.425 25.6754C16.425 25.3254 16.3042 25.0296 16.0625 24.7879C15.8208 24.5462 15.525 24.4254 15.175 24.4254ZM11.85 11.0254H28.125C28.3917 11.0254 28.6042 11.1046 28.7625 11.2629C28.9208 11.4212 29 11.6337 29 11.9004V18.6254C29 18.9087 28.9208 19.1504 28.7625 19.3504C28.6042 19.5504 28.3917 19.6504 28.125 19.6504H11.85C11.6 19.6504 11.3958 19.5504 11.2375 19.3504C11.0792 19.1504 11 18.9087 11 18.6254V11.9004C11 11.6337 11.0792 11.4212 11.2375 11.2629C11.3958 11.1046 11.6 11.0254 11.85 11.0254ZM12.5 12.5254V18.1504H27.5V12.5254H12.5ZM11.85 21.3504H28.025C28.275 21.3504 28.5 21.4546 28.7 21.6629C28.9 21.8712 29 22.1087 29 22.3754V28.9754C29 29.3087 28.9 29.5629 28.7 29.7379C28.5 29.9129 28.275 30.0004 28.025 30.0004H11.975C11.7083 30.0004 11.4792 29.9129 11.2875 29.7379C11.0958 29.5629 11 29.3087 11 28.9754V22.3754C11 22.1087 11.0792 21.8712 11.2375 21.6629C11.3958 21.4546 11.6 21.3504 11.85 21.3504ZM12.5 22.8504V28.5004H27.5V22.8504H12.5ZM12.5 12.5254V18.1504V12.5254ZM12.5 22.8504V28.5004V22.8504Z"
				fill="white"
			/>
		</svg>
		<div className="activity-log-item__actor-info">
			<div className="activity-log-item__actor-name">{ translate( 'Server' ) }</div>
		</div>
	</div>
);

const WORDPRESS_ACTOR = (
	<div className="activity-log-item__actor">
		<SocialLogo icon="wordpress" size={ 40 } />
		<div className="activity-log-item__actor-info">
			<div className="activity-log-item__actor-name">WordPress</div>
		</div>
	</div>
);

const MULTIPLE_ACTORS = (
	<div className="activity-log-item__actor">
		<ActivityActorIcon icon="multiple-users" />
		<div className="activity-log-item__actor-info">
			<div className="activity-log-item__actor-name">{ translate( 'Multiple users' ) }</div>
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
		if ( actorName === 'WordPress' && actorType === 'Application' ) {
			return WORDPRESS_ACTOR;
		}
		if ( actorName === 'Jetpack' && actorType === 'Application' ) {
			return JETPACK_ACTOR;
		}
		if ( actorName === 'Jetpack Boost' && actorType === 'Application' ) {
			return JETPACK_BOOST_ACTOR;
		}
		if ( actorName === 'Happiness Engineer' && actorType === 'Happiness Engineer' ) {
			return HAPPINESS_ACTOR;
		}
		if ( actorName === 'Server' && actorType === 'Application' ) {
			return SERVER_ACTOR;
		}
		if ( actorType === 'Multiple' ) {
			return MULTIPLE_ACTORS;
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
