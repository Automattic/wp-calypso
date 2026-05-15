import { TimeSince } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useId, useState } from 'react';
import { SocialAvatar } from '../../avatar';
import { SocialNotificationItem } from './notification-item';
import type { StackedRow, StackableCanonicalType } from './group-notifications';

const MAX_AVATARS = 3;
const FOLLOW_TRUNCATE_AT = 50;

interface Props {
	stack: StackedRow;
	onExpandedChange?: ( expanded: boolean, memberCount: number ) => void;
}

function isSafeUrl( url: string ): boolean {
	try {
		const parsed = new URL( url );
		return parsed.protocol === 'https:' || parsed.protocol === 'http:';
	} catch {
		return false;
	}
}

// Each branch owns a full sentence so translators control word order,
// verb agreement, and the "and N other(s)" conjunction without splicing
// nested translated fragments. Stacks form at members.length >= 2, so
// `second` is always populated in practice; the single-actor arm is a
// defensive fallback that should never run. The `_exhaustive: never`
// `default:` arms in each switch are also defensive — they only render
// if a new `canonical_type` ships in the wire payload before this
// switch is updated, which is why their copy is generic ("interacted
// with you") rather than action-specific.
function stackedPhrase(
	canonical: StackableCanonicalType,
	count: number,
	first: string,
	second: string | null,
	translate: ReturnType< typeof useTranslate >
): string {
	if ( ! second ) {
		switch ( canonical ) {
			case 'like':
				return translate( '%(first)s liked your post', { args: { first } } ) as string;
			case 'repost':
				return translate( '%(first)s reposted your post', { args: { first } } ) as string;
			case 'follow':
				return translate( '%(first)s followed you', { args: { first } } ) as string;
			case 'mention':
				return translate( '%(first)s mentioned you', { args: { first } } ) as string;
			case 'reply':
				return translate( '%(first)s replied to your post', { args: { first } } ) as string;
			case 'quote':
				return translate( '%(first)s quoted your post', { args: { first } } ) as string;
			default: {
				const _exhaustive: never = canonical;
				void _exhaustive;
				return translate( '%(first)s interacted with you', { args: { first } } ) as string;
			}
		}
	}

	const others = count - 2;
	if ( others > 0 ) {
		switch ( canonical ) {
			case 'like':
				return translate(
					'%(first)s, %(second)s and %(others)d other liked your post',
					'%(first)s, %(second)s and %(others)d others liked your post',
					{ count: others, args: { first, second, others } }
				) as string;
			case 'repost':
				return translate(
					'%(first)s, %(second)s and %(others)d other reposted your post',
					'%(first)s, %(second)s and %(others)d others reposted your post',
					{ count: others, args: { first, second, others } }
				) as string;
			case 'follow':
				return translate(
					'%(first)s, %(second)s and %(others)d other followed you',
					'%(first)s, %(second)s and %(others)d others followed you',
					{ count: others, args: { first, second, others } }
				) as string;
			case 'mention':
				return translate(
					'%(first)s, %(second)s and %(others)d other mentioned you',
					'%(first)s, %(second)s and %(others)d others mentioned you',
					{ count: others, args: { first, second, others } }
				) as string;
			case 'reply':
				return translate(
					'%(first)s, %(second)s and %(others)d other replied to your post',
					'%(first)s, %(second)s and %(others)d others replied to your post',
					{ count: others, args: { first, second, others } }
				) as string;
			case 'quote':
				return translate(
					'%(first)s, %(second)s and %(others)d other quoted your post',
					'%(first)s, %(second)s and %(others)d others quoted your post',
					{ count: others, args: { first, second, others } }
				) as string;
			default: {
				const _exhaustive: never = canonical;
				void _exhaustive;
				return translate(
					'%(first)s, %(second)s and %(others)d other interacted with you',
					'%(first)s, %(second)s and %(others)d others interacted with you',
					{ count: others, args: { first, second, others } }
				) as string;
			}
		}
	}

	switch ( canonical ) {
		case 'like':
			return translate( '%(first)s and %(second)s liked your post', {
				args: { first, second },
			} ) as string;
		case 'repost':
			return translate( '%(first)s and %(second)s reposted your post', {
				args: { first, second },
			} ) as string;
		case 'follow':
			return translate( '%(first)s and %(second)s followed you', {
				args: { first, second },
			} ) as string;
		case 'mention':
			return translate( '%(first)s and %(second)s mentioned you', {
				args: { first, second },
			} ) as string;
		case 'reply':
			return translate( '%(first)s and %(second)s replied to your post', {
				args: { first, second },
			} ) as string;
		case 'quote':
			return translate( '%(first)s and %(second)s quoted your post', {
				args: { first, second },
			} ) as string;
		default: {
			const _exhaustive: never = canonical;
			void _exhaustive;
			return translate( '%(first)s and %(second)s interacted with you', {
				args: { first, second },
			} ) as string;
		}
	}
}

export function StackedNotification( { stack, onExpandedChange }: Props ) {
	const translate = useTranslate();
	const reactId = useId();
	const [ expanded, setExpanded ] = useState( false );
	const isFollowStack = stack.canonicalType === 'follow';
	const safe = isSafeUrl( stack.targetUrl );

	const firstActor = stack.members[ 0 ].actor.display_name || stack.members[ 0 ].actor.handle;
	const secondActor = stack.members[ 1 ]
		? stack.members[ 1 ].actor.display_name || stack.members[ 1 ].actor.handle
		: null;
	const phrase = stackedPhrase(
		stack.canonicalType,
		stack.members.length,
		firstActor,
		secondActor,
		translate
	);

	const visibleAvatars = stack.members.slice( 0, MAX_AVATARS );
	const overflowCount = Math.max( 0, stack.members.length - MAX_AVATARS );
	const className = clsx( 'social-notifications-stack', { 'is-unread': stack.isUnread } );

	const visualHeader = (
		<HStack alignment="flex-start" spacing={ 3 }>
			<div className="social-notifications-stack__avatars">
				{ visibleAvatars.map( ( m ) => (
					<SocialAvatar
						key={ m.id }
						className="social-notifications-stack__avatar"
						src={ m.actor.avatar_url }
						alt=""
						fallback={
							<span className="social-notifications-stack__avatar is-placeholder" aria-hidden />
						}
					/>
				) ) }
				{ overflowCount > 0 && (
					<span className="social-notifications-stack__overflow" aria-hidden>
						{ '+' + overflowCount }
					</span>
				) }
			</div>
			<VStack spacing={ 1 } className="social-notifications-stack__body">
				<span className="social-notifications-stack__line">{ phrase }</span>
				{ stack.target?.excerpt ? (
					<span className="social-notifications-stack__excerpt">{ stack.target.excerpt }</span>
				) : null }
				<TimeSince className="social-notifications-stack__time" date={ stack.newestCreatedAt } />
			</VStack>
			{ stack.isUnread && (
				<span className="social-notifications-stack__unread">
					<span className="screen-reader-text">{ translate( 'Unread' ) as string }</span>
					<span className="social-notifications-stack__unread-dot" aria-hidden />
				</span>
			) }
		</HStack>
	);

	if ( ! isFollowStack ) {
		if ( safe ) {
			return (
				<a
					className={ className }
					href={ stack.targetUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ visualHeader }
				</a>
			);
		}
		// Non-interactive fallback when target_url isn't http(s)-safe.
		// `aria-label` on a generic div is ignored by screen readers
		// (no implicit role); rely on the visible phrase inside
		// `visualHeader` instead.
		return <div className={ className }>{ visualHeader }</div>;
	}

	// Two `<SocialNotificationsList>` instances mounted simultaneously
	// would otherwise produce duplicate DOM IDs — the follow-stack key
	// is always literally `'follow'`. `useId` gives a stable per-instance
	// suffix so `aria-controls` always resolves to the right list.
	const childListId = `social-notifications-stack-children-${ reactId }`;

	const visibleMembers = stack.members.slice( 0, FOLLOW_TRUNCATE_AT );

	return (
		<div className={ className }>
			<button
				type="button"
				className="social-notifications-stack__toggle"
				aria-expanded={ expanded }
				aria-controls={ childListId }
				onClick={ () => {
					setExpanded( ( prev ) => {
						const next = ! prev;
						onExpandedChange?.( next, stack.members.length );
						return next;
					} );
				} }
			>
				{ visualHeader }
			</button>
			{ expanded && (
				<div id={ childListId } className="social-notifications-stack__children" role="list">
					{ visibleMembers.map( ( m ) => (
						<SocialNotificationItem key={ m.id } notification={ m } />
					) ) }
				</div>
			) }
		</div>
	);
}
