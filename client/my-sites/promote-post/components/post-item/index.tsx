import { safeImageUrl } from '@automattic/calypso-url';
import { CompactCard } from '@automattic/components';
import './style.scss';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
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
	const [ loading, setLoading ] = useState( false );
	const dispatch = useDispatch();
	const keyValue = 'post-' + post.ID;
	const { isModalOpen, value, openModal, closeModal } = useRouteModal(
		'blazepress-widget',
		keyValue
	);

	const onCloseWidget = () => {
		setLoading( false );
		closeModal();
	};

	const onClickPromote = async () => {
		openModal();
		dispatch( recordDSPEntryPoint( 'promoted_posts-post_item' ) );
	};

	const safeUrl = safeImageUrl( post.featured_image );
	const featuredImage = safeUrl && resizeImageUrl( safeUrl, { h: 80 }, 0 );
	return (
		<CompactCard className="post-item__panel">
			<div className="post-item__detail">
				<h1 // eslint-disable-line
					className="post-item__title"
				>
					<a href={ post.URL } className="post-item__title-link">
						{ post.title || __( 'Untitled' ) }
					</a>
				</h1>
				<div className="post-item__meta">
					<span className="post-item__meta-time-status">
						{ post && (
							<PostRelativeTimeStatus
								showPublishedStatus={ false }
								post={ post }
								gridiconSize={ 12 }
							/>
						) }
					</span>
					<span className="post-item__post-type">{ getPostType( post.type ) }</span>
					<span className="post-item__post-type">
						<a href={ post.URL } className="post-item__title-view">
							{ __( 'View' ) }
						</a>
					</span>
				</div>
			</div>

			{ featuredImage && (
				<div className="post-item__post-thumbnail-wrapper ">
					<img className="post-item__post-thumbnail" src={ featuredImage } alt="" />
				</div>
			) }

			<div className="post-item__promote-link">
				<BlazePressWidget
					isVisible={ isModalOpen && value === keyValue }
					siteId={ post.site_ID }
					postId={ post.ID }
					onClose={ onCloseWidget }
				/>
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
