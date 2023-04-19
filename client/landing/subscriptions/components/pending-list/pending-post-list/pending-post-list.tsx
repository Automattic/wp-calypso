import { useTranslate } from 'i18n-calypso';
import PendingPostRow from './pending-post-row';
import '../styles.scss';
import type { PendingPostSubscription } from '@automattic/data-stores/src/reader/types';

type PendingPostListProps = {
	pendingPosts?: PendingPostSubscription[];
};

export default function PendingPostList( { pendingPosts }: PendingPostListProps ) {
	const translate = useTranslate();

	return (
		<ul className="subscription-manager__pending-list" role="table">
			<li className="row header" role="row">
				<span className="title-box" role="columnheader">
					{ translate( 'Subscribed post' ) }
				</span>
				<span className="date" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				<span className="actions" role="columnheader" />
			</li>
			{ pendingPosts &&
				pendingPosts.map( ( pendingPost ) => (
					<PendingPostRow key={ `pendingPosts.postrow.${ pendingPost.id }` } { ...pendingPost } />
				) ) }
		</ul>
	);
}
