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
export const SIZE_XS = 18;
export const SIZE_S = 32;
export const SIZE_M = 40;

type Props = Partial< Activity > & {
	size?: typeof SIZE_XS | typeof SIZE_S | typeof SIZE_M;
	withoutInfo?: boolean;
};

const ActivityActor: FunctionComponent< Props > = ( {
	actorAvatarUrl,
	actorName,
	actorRole,
	actorType,
	withoutInfo,
	size = SIZE_M,
} ) => {
	if ( actorName === 'WordPress' && actorType === 'Application' ) {
		return (
			<div className="activity-card__actor">
				<SocialLogo icon="wordpress" size={ size } />
				{ ! withoutInfo && (
					<div className="activity-card__actor-info">
						<div className="activity-card__actor-name">WordPress</div>
					</div>
				) }
			</div>
		);
	}

	if ( actorName === 'Jetpack' && actorType === 'Application' ) {
		return (
			<div className="activity-card__actor">
				{ isEnabled( 'jetpack/backup-simplified-screens-i4' ) && <JetpackLogo size={ size } /> }
				{ ! withoutInfo && (
					<div className="activity-card__actor-info">
						<div className="activity-card__actor-name">Jetpack</div>
					</div>
				) }
			</div>
		);
	}

	if ( actorName === 'Happiness Engineer' && actorType === 'Happiness Engineer' ) {
		return (
			<div className="activity-card__actor">
				{ isEnabled( 'jetpack/backup-simplified-screens-i4' ) && <JetpackLogo size={ size } /> }
				{ ! withoutInfo && (
					<div className="activity-card__actor-info">
						<div className="activity-card__actor-name">Happiness Engineer</div>
					</div>
				) }
			</div>
		);
	}

	if ( actorType === 'Multiple' ) {
		return (
			<div className="activity-card__actor">
				<Gridicon icon="multiple-users" size={ SIZE_XS } />
				{ ! withoutInfo && (
					<div className="activity-card__actor-info">
						<div className="activity-card__actor-name">{ translate( 'Multiple users' ) }</div>
					</div>
				) }
			</div>
		);
	}

	return (
		<div className="activity-card__actor">
			<Gravatar user={ { avatar_URL: actorAvatarUrl, display_name: actorName } } size={ size } />
			{ ! withoutInfo && (
				<div className="activity-card__actor-info">
					<div className="activity-card__actor-name">{ actorName }</div>
					{ actorRole && <div className="activity-card__actor-role">{ actorRole }</div> }
				</div>
			) }
		</div>
	);
};

export default ActivityActor;
