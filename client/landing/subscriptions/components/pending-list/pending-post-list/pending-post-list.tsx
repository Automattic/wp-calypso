import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import PendingPostRow from './pending-post-row';
import '../styles.scss';

type PendingPostListProps = {
	pendingPosts?: Reader.PendingPostSubscription[];
};

export default function PendingPostList( { pendingPosts }: PendingPostListProps ) {
	const translate = useTranslate();

	return (
		<div className="subscription-manager__comment-list" role="table">
			<div className="row-wrapper">
				<div className="row header" role="row">
					<span className="post" role="columnheader">
						{ translate( 'Subscribed comments' ) }
					</span>
					<span className="title-box" role="columnheader">
						{ translate( 'Site' ) }
					</span>
					<span className="date" role="columnheader">
						{ translate( 'Since' ) }
					</span>
					<span className="actions" role="columnheader" />
				</div>
			</div>

			{ pendingPosts &&
				pendingPosts.map( ( pendingPost ) => (
					<PendingPostRow key={ `pendingPosts.postrow.${ pendingPost.id }` } { ...pendingPost } />
				) ) }
		</div>
	);
}
