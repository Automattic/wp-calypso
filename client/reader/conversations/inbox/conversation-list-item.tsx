import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { usePost } from 'calypso/reader/data/post';
import type { Conversation } from './group-notes';

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
			<button
				type="button"
				className={ clsx( 'conversations-inbox__item', {
					'is-selected': isSelected,
					'is-unread': unreadCount > 0,
				} ) }
				aria-current={ isSelected || undefined }
				onClick={ () => onSelect( conversation ) }
			>
				<span className="conversations-inbox__item-header">
					<span className="conversations-inbox__item-title">{ title }</span>
					<span className="conversations-inbox__item-time">
						{ moment( timestamp ).fromNow( true ) }
					</span>
				</span>
				{ firstCommenter && (
					<span className="conversations-inbox__item-commenters">
						<span className="conversations-inbox__avatars">
							{ commenters.slice( 0, MAX_AVATARS ).map( ( { name, avatar } ) => (
								<img key={ name } src={ avatar } alt="" width={ 24 } height={ 24 } />
							) ) }
						</span>
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
					</span>
				) }
				<span className="conversations-inbox__item-footer">
					<span className="conversations-inbox__item-excerpt">{ excerpt }</span>
					{ unreadCount > 0 && (
						<span className="conversations-inbox__item-new">
							{ translate( '%(count)d new', { args: { count: unreadCount } } ) }
						</span>
					) }
				</span>
			</button>
		</li>
	);
}
