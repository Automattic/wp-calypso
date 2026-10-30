import {
	Button,
	ExternalLink,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { chevronDown, chevronLeft, chevronRight, chevronUp } from '@wordpress/icons';
import { useRtl, useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { usePost } from 'calypso/reader/data/post';
import { getPostUrl } from 'calypso/reader/route';
import type { Conversation } from '../group-notes';

import './style.scss';

interface Props {
	siteId: number;
	postId: number;
	conversation?: Conversation;
	onBack?: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	highlightedCommentIds?: number[];
}

export function ConversationDetail( {
	siteId,
	postId,
	conversation,
	onBack,
	onPrevious,
	onNext,
	highlightedCommentIds,
}: Props ) {
	const translate = useTranslate();
	const isRtl = useRtl();
	const backRef = useRef< HTMLButtonElement >( null );
	const moment = useLocalizedMoment();
	const { data: post, isLoading } = usePost( { blogId: siteId, postId } );

	const commentCount = Number(
		( post?.discussion as { comment_count?: number } )?.comment_count ?? 0
	);
	const author = post?.author as { name?: string } | undefined;

	useEffect( () => {
		backRef.current?.focus();
	}, [] );

	return (
		<VStack spacing={ 0 } className="conversations-inbox__detail-pane">
			<HStack as="header" expanded={ false } className="conversations-inbox__detail-header">
				<HStack justify="flex-start" spacing={ 2 }>
					{ onBack && (
						<Button
							ref={ backRef }
							__next40pxDefaultSize
							icon={ isRtl ? chevronRight : chevronLeft }
							onClick={ onBack }
						>
							{ translate( 'Conversations' ) }
						</Button>
					) }
					<Heading level={ 2 } size={ 20 } weight={ 500 } color="inherit">
						{ translate( 'You follow this' ) }
					</Heading>
				</HStack>
				<HStack spacing={ 0 } expanded={ false }>
					<Button
						__next40pxDefaultSize
						icon={ chevronUp }
						label={ translate( 'Previous conversation' ) }
						disabled={ ! onPrevious }
						onClick={ onPrevious }
					/>
					<Button
						__next40pxDefaultSize
						icon={ chevronDown }
						label={ translate( 'Next conversation' ) }
						disabled={ ! onNext }
						onClick={ onNext }
					/>
				</HStack>
			</HStack>
			<div className="conversations-inbox__detail-body">
				<VStack spacing={ 10 } className="conversations-inbox__detail-content">
					{ isLoading && ! post && <Spinner /> }
					{ !! post?.is_error && (
						<Text as="p" color="var(--color-text-subtle)">
							{ translate( 'This post can’t be loaded.' ) }{ ' ' }
							{ conversation?.url && (
								<ExternalLink href={ conversation.url }>
									{ translate( 'Open it on the site' ) }
								</ExternalLink>
							) }
						</Text>
					) }
					{ post && ! post.is_error && (
						<>
							<VStack
								as="a"
								spacing={ 3 }
								className="conversations-inbox__post-card"
								href={ getPostUrl( post ) }
							>
								<HStack
									as="span"
									justify="flex-start"
									wrap
									className="conversations-inbox__post-meta"
								>
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
									{ !! post.date && (
										<span>· { moment( String( post.date ) ).format( 'll' ) }</span>
									) }
								</HStack>
								<Heading level={ 3 } size={ 20 } weight={ 500 } color="inherit">
									{ String( post.title ?? conversation?.title ?? '' ) }
								</Heading>
								<Text truncate numberOfLines={ 1 } color="var(--color-text-subtle)">
									{ String( post.better_excerpt_no_html ?? post.excerpt_no_html ?? '' ) }
								</Text>
							</VStack>

							<Comments
								key={ `${ siteId }-${ postId }` }
								useBlockEditor
								showNestingReplyArrow
								post={ post }
								initialSize={ commentCount || 10 }
								pageSize={ 25 }
								startingCommentId={ conversation?.latestCommentId }
								commentCount={ commentCount }
								maxDepth={ 1 }
								commentsFilterDisplay={ COMMENTS_FILTER_ALL }
								shouldHighlightNew
								highlightedCommentIds={ highlightedCommentIds }
								collapsibleThreads
							/>
						</>
					) }
				</VStack>
			</div>
		</VStack>
	);
}
