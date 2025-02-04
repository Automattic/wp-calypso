import { useTranslate } from 'i18n-calypso';
import { VirtualizedList } from '../virtualized-list';
import CommentRow from './comment-row';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';
import './styles.scss';

type CommentListProps = {
	posts?: PostSubscription[];
};

const CommentList = ( { posts }: CommentListProps ) => {
	const translate = useTranslate();

	return (
		<div className="subscription-manager__comment-list" role="table">
			<div className="row-wrapper header">
				<div className="row header" role="row">
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
				</div>
			</div>

			{ posts ? (
				<VirtualizedList items={ posts }>
					{ ( { item, key, style, registerChild } ) => (
						<CommentRow
							key={ `${ item.id }-${ key }` }
							style={ style }
							forwardedRef={ registerChild }
							{ ...item }
						/>
					) }
				</VirtualizedList>
			) : null }
		</div>
	);
};

export default CommentList;
