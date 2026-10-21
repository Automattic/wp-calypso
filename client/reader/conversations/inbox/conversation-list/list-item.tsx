import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { usePost } from 'calypso/reader/data/post';
import type { Conversation } from '../group-notes';

interface Props {
	conversation: Conversation;
	isSelected: boolean;
	onSelect: ( conversation: Conversation ) => void;
}

const MAX_AVATARS = 3;

export function ConversationListItem( { conversation, isSelected, onSelect }: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { siteId, postId, excerpt, timestamp, commenters, unreadNoteIds } = conversation;
	const { data: post } = usePost( conversation.title ? null : { blogId: siteId, postId } );
	const title = conversation.title || String( post?.title ?? '' );
	const [ firstCommenter ] = commenters;
	const othersCount = commenters.length - 1;
	const unreadCount = unreadNoteIds.length;

	return (
		<li>
			<VStack
				as="button"
				spacing={ 2.5 }
				type="button"
				className={ clsx( 'conversations-inbox__item', {
					'is-selected': isSelected,
					'is-unread': unreadCount > 0,
				} ) }
				aria-current={ isSelected || undefined }
				onClick={ () => onSelect( conversation ) }
			>
				<HStack as="span">
					<span className="conversations-inbox__item-title">{ title }</span>
					<Text size={ 14 } color="var(--color-text-subtle)">
						{ moment( timestamp ).fromNow( true ) }
					</Text>
				</HStack>
				{ firstCommenter && (
					<HStack as="span" justify="flex-start">
						<HStack
							as="span"
							spacing={ 0 }
							expanded={ false }
							className="conversations-inbox__avatars"
						>
							{ commenters.slice( 0, MAX_AVATARS ).map( ( { name, avatar } ) => (
								<img key={ name } src={ avatar } alt="" width={ 24 } height={ 24 } />
							) ) }
						</HStack>
						<span>
							{ othersCount > 0 ? (
								translate(
									'{{b}}%(name)s{{/b}} and %(count)d other',
									'{{b}}%(name)s{{/b}} and %(count)d others',
									{
										count: othersCount,
										args: { name: firstCommenter.name, count: othersCount },
										components: { b: <strong /> },
									}
								)
							) : (
								<strong>{ firstCommenter.name }</strong>
							) }
						</span>
					</HStack>
				) }
				<HStack as="span">
					<span className="conversations-inbox__item-excerpt">{ excerpt }</span>
					{ unreadCount > 0 && (
						<Text color="var(--color-primary)" className="conversations-inbox__item-new">
							{ translate( '%(count)d new', { args: { count: unreadCount } } ) }
						</Text>
					) }
				</HStack>
			</VStack>
		</li>
	);
}
