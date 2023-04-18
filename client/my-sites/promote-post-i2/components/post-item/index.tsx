import { safeImageUrl } from '@automattic/calypso-url';
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
		<tr className="post-item__row">
			<td className="post-item__post-data">
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
			</td>

			<td className="post-item__post-type">{ getPostType( post.type ) }</td>
			<td className="post-item__post-publish-date">
				<PostRelativeTimeStatus // TODO: adjust publish date according to Figma
					showPublishedStatus={ false }
					post={ post }
					showGridIcon={ false }
				/>
			</td>

			{ /* TODO: put the number of visitors and likes */ }
			<td className="post-item__post-visitors">0</td>
			<td className="post-item__post-likes">0</td>
			<td className="post-item__post-comments">0</td>
			<td className="post-item__post-view">
				<a href={ post.URL } className="post-item__title-view">
					{ __( 'View' ) }
				</a>
			</td>
			<td className="post-item__post-promote">
				<Button
					className="post-item__post-promote-button"
					variant="link"
					isBusy={ loading }
					disabled={ loading }
					onClick={ onClickPromote }
				>
					{ __( 'Promote' ) }
				</Button>
			</td>
		</tr>
	);
}
