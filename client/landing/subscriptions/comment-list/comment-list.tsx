import { useTranslate } from 'i18n-calypso';
import CommentRow from './comment-row';
import './styles.scss';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

type CommentListProps = {
	posts?: PostSubscription[];
};

const CommentList = ( { posts }: CommentListProps ) => {
	const translate = useTranslate();

	return (
		<ul className="subscription-manager__comment-list" role="table">
			<li className="row header" role="row">
				<span className="post" role="columnheader">
					{ translate( 'Subscribed post' ) }
				</span>
				<span className="title-box" role="columnheader">
					{ translate( 'Site' ) }
				</span>
				<span className="date" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				<span className="actions" role="columnheader" />
			</li>
			{ posts &&
				posts.map( ( post ) => (
					<CommentRow key={ `posts.commentrow.${ post.id }` } { ...post } />
				) ) }
		</ul>
	);
};

export default CommentList;
