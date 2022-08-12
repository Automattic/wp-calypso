import { CompactCard } from '@automattic/components';
import './style.scss';
import { Button } from '@wordpress/components';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import BlazePressPromotion from 'calypso/components/blazepress';
import { recordDSPEntryPoint, showDSPWidgetModal } from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import PostRelativeTimeStatus from 'calypso/my-sites/post-relative-time-status';

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
	const { isModalOpen, value, openModal, closeModal } = useRouteModal( 'blazePress', keyValue );
	const onClickPromote = () => {
		setLoading( true );
		openModal();
		( async () => {
			await showDSPWidgetModal( post.site_ID, post.ID );
			dispatch( recordDSPEntryPoint( 'promoted_posts-post_item' ) );
			setLoading( false );
		} )();
	};

	const onCloseWidget = () => {
		closeModal();
	};

	return (
		<CompactCard className="post-item__card">
			<div className="post-item__main">
				<div className="post-item__image-container">
					<img className="post-item__image" src={ post.featured_image } alt="" />
				</div>
				<div className="post-item__body">
					<div className="post-item__title">{ post.title }</div>
					<div className="post-item__subtitle">
						<PostRelativeTimeStatus showPublishedStatus={ false } post={ post } />
						<Button isLink href={ post.URL }>
							View
						</Button>
					</div>
				</div>
			</div>
			<div className="post-item__promote-link">
				<BlazePressPromotion
					isVisible={ isModalOpen && value === keyValue }
					isLoading={ loading }
					onClose={ onCloseWidget }
				/>
				<Button isBusy={ loading } disabled={ loading } isLink onClick={ onClickPromote }>
					Promote
				</Button>
			</div>
		</CompactCard>
	);
}
