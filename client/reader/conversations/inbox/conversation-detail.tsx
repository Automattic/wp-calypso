import { Button, Spinner } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { usePost } from 'calypso/reader/data/post';
import { getPostUrl } from 'calypso/reader/route';
import type { Conversation } from './group-notes';

interface Props {
	siteId: number;
	postId: number;
	conversation?: Conversation;
	onPrevious?: () => void;
	onNext?: () => void;
}

export function ConversationDetail( { siteId, postId, conversation, onPrevious, onNext }: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { data: post, isLoading } = usePost( { blogId: siteId, postId } );

	const commentCount = Number(
		( post?.discussion as { comment_count?: number } )?.comment_count ?? 0
	);
	const author = post?.author as { name?: string } | undefined;

	return (
		<div className="conversations-inbox__detail-pane">
			<header className="conversations-inbox__detail-header">
				<h2 className="conversations-inbox__pane-title">{ translate( 'You follow this' ) }</h2>
				<div>
					<Button
						icon={ chevronUp }
						label={ translate( 'Previous conversation' ) }
						disabled={ ! onPrevious }
						onClick={ onPrevious }
					/>
					<Button
						icon={ chevronDown }
						label={ translate( 'Next conversation' ) }
						disabled={ ! onNext }
						onClick={ onNext }
					/>
				</div>
			</header>
			<div className="conversations-inbox__detail-body">
				{ isLoading && ! post && <Spinner /> }
				{ post && ! post.is_error && (
					<>
						<a className="conversations-inbox__post-card" href={ getPostUrl( post ) }>
							<span className="conversations-inbox__post-meta">
								{ !! post.site_icon && (
									<img
										src={ ( post.site_icon as { img?: string } )?.img }
										alt=""
										width={ 24 }
										height={ 24 }
									/>
								) }
								<strong>{ String( post.site_name ?? '' ) }</strong>
								{ author?.name && <span>{ author.name }</span> }
								{ !! post.date && <span>· { moment( String( post.date ) ).format( 'll' ) }</span> }
							</span>
							<span className="conversations-inbox__post-title">
								{ String( post.title ?? conversation?.title ?? '' ) }
							</span>
							<span className="conversations-inbox__post-excerpt">
								{ String( post.better_excerpt_no_html ?? post.excerpt_no_html ?? '' ) }
							</span>
						</a>

						<Comments
							key={ `${ siteId }-${ postId }` }
							showNestingReplyArrow
							post={ post }
							initialSize={ commentCount || 10 }
							pageSize={ 25 }
							startingCommentId={ conversation?.latestCommentId }
							commentCount={ commentCount }
							maxDepth={ 1 }
							commentsFilterDisplay={ COMMENTS_FILTER_ALL }
							shouldHighlightNew
						/>
					</>
				) }
			</div>
		</div>
	);
}
