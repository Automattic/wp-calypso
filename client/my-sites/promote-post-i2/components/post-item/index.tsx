import { safeImageUrl } from '@automattic/calypso-url';
import { CompactCard } from '@automattic/components';
import './style.scss';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordDSPEntryPoint } from 'calypso/lib/promote-post';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { useRouteModal } from 'calypso/lib/route-modal';
import PostRelativeTimeStatus from 'calypso/my-sites/post-relative-time-status';
import { getPostType } from 'calypso/my-sites/promote-post/utils';

export type Post = {
	ID: number;
	global_ID: string;
	featured_image: string;
	title: string;
	date: string;
	modified: string;
	excerpt: string;
	content: string;
	site_ID: number;
	slug: string;
	status: string;
	type: string; // post, page
	URL: string;
};

type Props = {
	post: Post;
};

export default function PostItem( { post }: Props ) {
	const [ loading ] = useState( false );
	const dispatch = useDispatch();
	const keyValue = 'post-' + post.ID;
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );

	const onClickPromote = async () => {
		openModal();
		dispatch( recordDSPEntryPoint( 'promoted_posts-post_item' ) );
	};

	const safeUrl = safeImageUrl( post.featured_image );
	const featuredImage = safeUrl && resizeImageUrl( safeUrl, { h: 80 }, 0 );

	return (
		<CompactCard className="post-item__row">
			<div className="posts-list__column-post">
				{ featuredImage && (
					<div
						className="post-item__post-thumbnail-wrapper"
						style={ { backgroundImage: `url(${ featuredImage })` } }
					/>
				) }
				{ ! featuredImage && (
					<div className="post-item__post-thumbnail-wrapper post-item__post-thumbnail-wrapper_no-image" />
				) }
				<div className="post-item__post-title">{ post?.title || __( 'Untitled' ) }</div>
			</div>

			<div className="posts-list__column-type post-item__post-type">
				{ getPostType( post.type ) }
			</div>
			<div className="posts-list__column-publish-date post-item__post-publish-date">
				<PostRelativeTimeStatus
					showPublishedStatus={ false }
					post={ post }
					showGridIcon={ false }
				/>
			</div>

			<div className="posts-list__column-publish-date post-item__post-visitors">0</div>
			<div className="posts-list__column-publish-date post-item__post-likes">0</div>
			<div className="posts-list__column-publish-date post-item__post-view">
				<a href={ post.URL } className="post-item__title-view">
					{ __( 'View' ) }
				</a>
			</div>
			<div className="posts-list__column-publish-date post-item__post-promote">
				<Button
					isPrimary={ true }
					isBusy={ loading }
					disabled={ loading }
					onClick={ onClickPromote }
				>
					{ __( 'Promote' ) }
				</Button>
			</div>
		</CompactCard>
	);
}
