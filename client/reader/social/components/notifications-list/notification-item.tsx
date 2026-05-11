import './style.scss';

import { TimeSince } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type {
	AtmosphereNotification,
	AtmosphereNotificationCanonicalType,
} from '@automattic/api-core';

interface Props {
	notification: AtmosphereNotification;
}

export function SocialNotificationItem( { notification }: Props ) {
	const translate = useTranslate();
	const { actor, target, target_url, canonical_type, protocol_type, is_read, created_at } =
		notification;
	const actorName = actor.display_name || actor.handle;
	const phrase = actionPhrase( canonical_type, protocol_type, translate );
	const ariaLabel = translate( '%(actor)s %(phrase)s', {
		args: { actor: actorName, phrase: String( phrase ) },
	} ) as string;

	return (
		<a
			className={ clsx( 'social-notification-item', { 'is-unread': ! is_read } ) }
			href={ target_url }
			target="_blank"
			rel="noopener noreferrer"
			aria-label={ ariaLabel }
		>
			<HStack alignment="flex-start" spacing={ 3 }>
				{ actor.avatar_url ? (
					<img className="social-notification-item__avatar" src={ actor.avatar_url } alt="" />
				) : (
					<span className="social-notification-item__avatar is-placeholder" aria-hidden />
				) }
				<VStack spacing={ 1 } className="social-notification-item__body">
					<span className="social-notification-item__line">
						<span className="social-notification-item__actor">{ actorName }</span>{ ' ' }
						<span className="social-notification-item__phrase">{ phrase }</span>
					</span>
					{ target?.excerpt ? (
						<span className="social-notification-item__excerpt">{ target.excerpt }</span>
					) : null }
					{ created_at ? (
						<TimeSince className="social-notification-item__time" date={ created_at } />
					) : null }
				</VStack>
				{ ! is_read && (
					<span
						className="social-notification-item__unread-dot"
						aria-label={ translate( 'Unread' ) as string }
					/>
				) }
			</HStack>
		</a>
	);
}

function actionPhrase(
	canonical: AtmosphereNotificationCanonicalType,
	protocolType: string,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( canonical ) {
		case 'like':
			return translate( 'liked your post' ) as string;
		case 'repost':
			return translate( 'reposted your post' ) as string;
		case 'follow':
			return translate( 'followed you' ) as string;
		case 'mention':
			return translate( 'mentioned you' ) as string;
		case 'reply':
			return translate( 'replied to your post' ) as string;
		case 'quote':
			return translate( 'quoted your post' ) as string;
		case 'other':
		default:
			// e.g. 'starterpack-joined' -> 'starterpack joined'.
			return protocolType.replace( /[-_]/g, ' ' );
	}
}
