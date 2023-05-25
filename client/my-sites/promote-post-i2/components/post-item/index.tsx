import { safeImageUrl } from '@automattic/calypso-url';
import './style.scss';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordDSPEntryPoint } from 'calypso/lib/promote-post';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { useRouteModal } from 'calypso/lib/route-modal';
import PostRelativeTimeStatus from 'calypso/my-sites/post-relative-time-status';
import { getPostType } from 'calypso/my-sites/promote-post/utils';

type Discussion = {
	comment_count: number;
};

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
	like_count: number;
	discussion: Discussion;
	views: number;
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

	const postDate = (
		<PostRelativeTimeStatus showPublishedStatus={ false } post={ post } showGridIcon={ false } />
	);

	const viewCount = post?.views ?? 0;
	const likeCount = post?.like_count ?? 0;
	const commentCount = post.discussion.comment_count;

	return (
		<tr className="post-item__row">
			<td className="post-item__post-data">
				<div className="post-item__post-data-row">
					{ featuredImage && (
						<div
							className="post-item__post-thumbnail-wrapper"
							style={ { backgroundImage: `url(${ featuredImage })` } }
						/>
					) }
					{ ! featuredImage && (
						<div className="post-item__post-thumbnail-wrapper post-item__post-thumbnail-wrapper_no-image">
							<svg // "No image found" icon
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M17.5576 5.4415L16.4996 4.38344L15.4415 5.4415L14.5576 4.55762L15.6157 3.49956L14.5576 2.4415L15.4415 1.55762L16.4996
									2.61568L17.5576 1.55762L18.4415 2.4415L17.3834 3.49956L18.4415 4.55762L17.5576 5.4415ZM17.5 15.8333V6.85506C17.1831 6.94936 16.8475 7 16.5 7C16.4159 7 16.3326 6.99704
									16.25 6.99121V11.1306L13.769 8.71854C13.5264 8.48271 13.1402 8.48271 12.8976 8.71854L9.92167 11.6119L7.48278 10.0311C7.26548 9.89025 6.98384 9.89799 6.77461 10.0506L3.75
									12.256L3.75 4.16667C3.75 3.93655 3.93655 3.75 4.16667 3.75L13.0088 3.75C13.003 3.66742 13 3.58406 13 3.5C13 3.15251 13.0506 2.81685 13.1449 2.5L4.16667 2.5C3.24619 2.5 2.5
									3.24619 2.5 4.16667L2.5 15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333ZM3.75 13.803V15.8333C3.75 16.0635 3.93655 16.25
									4.16667 16.25H15.8333C16.0635 16.25 16.25 16.0635 16.25 15.8333V12.836L16.231 12.8555L13.3333 10.0384L10.4357 12.8555C10.2266 13.0588 9.90474 13.0905 9.66005
									12.9319L7.16369 11.3139L3.75 13.803Z"
									fill="#8C8F94"
								/>
							</svg>
						</div>
					) }
					<div className="post-item__post-title">
						<div className="post-item__post-subheading-mobile">
							{ getPostType( post.type ) }
							<span className="post-item__mid-dot">&#183;</span>
							{ postDate }
						</div>
						<div className="post-item__post-title-content">{ post?.title || __( 'Untitled' ) }</div>
					</div>
				</div>
				<div className="post-item__post-data-row post-item__post-data-row-mobile">
					<div className="post-item__stats-mobile">
						{
							// translators: %d is number of post's views
							sprintf( _n( '%d view', '%d views', viewCount ), viewCount )
						}
						<span className="post-item__mid-dot">&#183;</span>
						{
							// translators: %d is number of post's likes
							sprintf( _n( '%d view', '%d views', likeCount ), likeCount )
						}
						<span className="post-item__mid-dot">&#183;</span>
						{
							// translators: %d is number of post's comments
							sprintf( _n( '%d comment', '%d comments', commentCount ), commentCount )
						}
					</div>
					<div className="post-item__actions-mobile">
						<a href={ post.URL } className="post-item__view-link">
							{ __( 'View' ) }
						</a>
						<Button
							className="post-item__post-promote-button"
							isBusy={ loading }
							disabled={ loading }
							onClick={ onClickPromote }
						>
							{ __( 'Promote' ) }
						</Button>
					</div>
				</div>
			</td>

			<td className="post-item__post-type">{ getPostType( post.type ) }</td>
			<td className="post-item__post-publish-date">{ postDate }</td>
			<td className="post-item__post-views">{ viewCount }</td>
			<td className="post-item__post-likes">{ likeCount }</td>
			<td className="post-item__post-comments">{ commentCount }</td>
			<td className="post-item__post-view">
				<a href={ post.URL } className="post-item__view-link">
					{ __( 'View' ) }
				</a>
			</td>
			<td className="post-item__post-promote">
				<Button
					className="post-item__post-promote-button"
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
