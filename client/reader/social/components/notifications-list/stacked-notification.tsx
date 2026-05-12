import { TimeSince } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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

function stackedPhrase(
	canonical: StackableCanonicalType,
	count: number,
	first: string,
	second: string | null,
	translate: ReturnType< typeof useTranslate >
): string {
	const others = count - ( second ? 2 : 1 );
	let subject: string;
	if ( second && others > 0 ) {
		subject = translate(
			'%(first)s, %(second)s and %(others)d other',
			'%(first)s, %(second)s and %(others)d others',
			{
				count: others,
				args: { first, second, others },
			}
		) as string;
	} else if ( second ) {
		subject = translate( '%(first)s and %(second)s', { args: { first, second } } ) as string;
	} else {
		subject = first;
	}

	switch ( canonical ) {
		case 'like':
			return translate( '%(subject)s liked your post', { args: { subject } } ) as string;
		case 'repost':
			return translate( '%(subject)s reposted your post', { args: { subject } } ) as string;
		case 'follow':
			return translate( '%(subject)s followed you', { args: { subject } } ) as string;
		case 'mention':
			return translate( '%(subject)s mentioned you', { args: { subject } } ) as string;
		case 'reply':
			return translate( '%(subject)s replied to your post', { args: { subject } } ) as string;
		case 'quote':
			return translate( '%(subject)s quoted your post', { args: { subject } } ) as string;
		default: {
			// Exhaustiveness guard. If the union widens, fail typecheck
			// here rather than silently collapsing the new type into
			// generic "interacted" copy.
			const _exhaustive: never = canonical;
			void _exhaustive;
			return translate( '%(subject)s interacted with you', { args: { subject } } ) as string;
		}
	}
}

export function StackedNotification( { stack, onExpandedChange }: Props ) {
	const translate = useTranslate();
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
				{ visibleAvatars.map( ( m ) =>
					m.actor.avatar_url ? (
						<img
							key={ m.id }
							className="social-notifications-stack__avatar"
							src={ m.actor.avatar_url }
							alt=""
						/>
					) : (
						<span
							key={ m.id }
							className="social-notifications-stack__avatar is-placeholder"
							aria-hidden
						/>
					)
				) }
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
			{ stack.isUnread && <span className="social-notifications-stack__unread-dot" aria-hidden /> }
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
					aria-label={ phrase }
				>
					{ visualHeader }
				</a>
			);
		}
		return (
			<div className={ className } aria-label={ phrase }>
				{ visualHeader }
			</div>
		);
	}

	const childListId = `social-notifications-stack-children-${ stack.groupKey.replace(
		/[^a-z0-9]/gi,
		'-'
	) }`;

	const visibleMembers = stack.members.slice( 0, FOLLOW_TRUNCATE_AT );

	return (
		<div className={ className }>
			<button
				type="button"
				className="social-notifications-stack__toggle"
				aria-expanded={ expanded }
				aria-controls={ childListId }
				aria-label={ phrase }
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
