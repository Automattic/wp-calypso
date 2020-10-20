/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import Gravatar from 'calypso/components/gravatar';
import Gridicon from 'calypso/components/gridicon';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SocialLogo from 'calypso/components/social-logo';

/**
 * Type dependencies
 */
import { Activity } from 'calypso/state/activity-log/types';

/**
 * Module constants
 */
const JETPACK_ACTOR = (
	<div className="activity-card__actor">
		{ ! isEnabled( 'jetpack/backup-simplified-screens' ) && <JetpackLogo size={ 40 } /> }
		<div className="activity-card__actor-info">
			<div className="activity-card__actor-name">Jetpack</div>
		</div>
	</div>
);

const HAPPINESS_ACTOR = (
	<div className="activity-card__actor">
		{ ! isEnabled( 'jetpack/backup-simplified-screens' ) && <JetpackLogo size={ 40 } /> }
		<div className="activity-card__actor-info">
			<div className="activity-card__actor-name">Happiness Engineer</div>
		</div>
	</div>
);

const WORDPRESS_ACTOR = (
	<div className="activity-card__actor">
		<SocialLogo icon="wordpress" size={ 40 } />
		<div className="activity-card__actor-info">
			<div className="activity-card__actor-name">WordPress</div>
		</div>
	</div>
);

const MULTIPLE_ACTORS = (
	<div className="activity-card__actor">
		<Gridicon icon="multiple-users" size={ 18 } />
		<div className="activity-card__actor-info">
			<div className="activity-card__actor-name">{ translate( 'Multiple users' ) }</div>
		</div>
	</div>
);

type Props = Partial< Activity >;

const ActivityActor: FunctionComponent< Props > = ( {
	actorAvatarUrl,
	actorName,
	actorRole,
	actorType,
} ) => {
	if ( actorName === 'WordPress' && actorType === 'Application' ) {
		return WORDPRESS_ACTOR;
	}
	if ( actorName === 'Jetpack' && actorType === 'Application' ) {
		return JETPACK_ACTOR;
	}
	if ( actorName === 'Happiness Engineer' && actorType === 'Happiness Engineer' ) {
		return HAPPINESS_ACTOR;
	}
	if ( actorType === 'Multiple' ) {
		return MULTIPLE_ACTORS;
	}

	return (
		<div className="activity-card__actor">
			<Gravatar user={ { avatar_URL: actorAvatarUrl } } size={ 40 } />
			<div className="activity-card__actor-info">
				<div className="activity-card__actor-name">{ actorName }</div>
				{ actorRole && <div className="activity-card__actor-role">{ actorRole }</div> }
			</div>
		</div>
	);
};

export default ActivityActor;
