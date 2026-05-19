import './style.scss';

import { TimeSince } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { SocialAvatar } from '../../avatar';
import type {
	AtmosphereNotification,
	AtmosphereNotificationCanonicalType,
	FediverseNotification,
	FediverseNotificationCanonicalType,
	MastodonNotification,
	MastodonNotificationCanonicalType,
} from '@automattic/api-core';

// The wpcom backend ships byte-compatible notification envelopes across
// protocols; the per-protocol types share the same canonical_type union.
// Aliased here so the renderer takes any of them without per-protocol branching.
// Keep all arms in the union so a future per-protocol widening surfaces as
// a switch-exhaustiveness error instead of being silently funneled to 'other'.
export type SocialNotification =
	| AtmosphereNotification
	| MastodonNotification
	| FediverseNotification;
type SocialNotificationCanonicalType =
	| AtmosphereNotificationCanonicalType
	| MastodonNotificationCanonicalType
	| FediverseNotificationCanonicalType;

interface Props {
	notification: SocialNotification;
}

function isSafeUrl( url: string ): boolean {
	try {
		const parsed = new URL( url );
		return parsed.protocol === 'https:' || parsed.protocol === 'http:';
	} catch {
		return false;
	}
}

export function SocialNotificationItem( { notification }: Props ) {
	const translate = useTranslate();
	const { actor, target, target_url, canonical_type, is_read, created_at } = notification;
	const actorName = actor.display_name || actor.handle;
	const phrase = actionPhrase( canonical_type, translate );
	const actionLabel = actionAriaLabel( canonical_type, actorName, translate );
	// An explicit `aria-label` on the anchor replaces the accessible name, so
	// the inner SR-only "Unread" span would never be announced. Fold the unread
	// state into the label instead.
	const ariaLabel = is_read
		? actionLabel
		: ( translate( 'Unread. %(label)s', { args: { label: actionLabel } } ) as string );

	const safe = isSafeUrl( target_url );
	const className = clsx( 'social-notification-item', { 'is-unread': ! is_read } );

	const body = (
		<HStack alignment="flex-start" spacing={ 3 }>
			{ /* Decorative: the actor identity is announced via the row aria-label. */ }
			<SocialAvatar
				className="social-notification-item__avatar"
				src={ actor.avatar_url }
				alt=""
				fallback={
					<span className="social-notification-item__avatar is-placeholder" aria-hidden />
				}
			/>
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
			{ ! is_read && <span className="social-notification-item__unread-dot" aria-hidden /> }
		</HStack>
	);

	if ( safe ) {
		return (
			<a
				className={ className }
				href={ target_url }
				target="_blank"
				rel="noopener noreferrer"
				aria-label={ ariaLabel }
			>
				{ body }
			</a>
		);
	}

	return (
		<div className={ className } aria-label={ ariaLabel }>
			{ body }
		</div>
	);
}

function actionPhrase(
	canonical: SocialNotificationCanonicalType,
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
			return translate( 'interacted with you' ) as string;
		default: {
			// Future per-protocol union widening should fail to type-check here
			// instead of silently funneling new kinds to the generic phrase.
			const _exhaustive: never = canonical;
			void _exhaustive;
			return translate( 'interacted with you' ) as string;
		}
	}
}

function actionAriaLabel(
	canonical: SocialNotificationCanonicalType,
	actor: string,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( canonical ) {
		case 'like':
			return translate( '%(actor)s liked your post', { args: { actor } } ) as string;
		case 'repost':
			return translate( '%(actor)s reposted your post', { args: { actor } } ) as string;
		case 'follow':
			return translate( '%(actor)s followed you', { args: { actor } } ) as string;
		case 'mention':
			return translate( '%(actor)s mentioned you', { args: { actor } } ) as string;
		case 'reply':
			return translate( '%(actor)s replied to your post', { args: { actor } } ) as string;
		case 'quote':
			return translate( '%(actor)s quoted your post', { args: { actor } } ) as string;
		case 'other':
			return translate( '%(actor)s interacted with you', { args: { actor } } ) as string;
		default: {
			const _exhaustive: never = canonical;
			void _exhaustive;
			return translate( '%(actor)s interacted with you', { args: { actor } } ) as string;
		}
	}
}
