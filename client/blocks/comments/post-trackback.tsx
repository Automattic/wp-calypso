import { Gridicon, TimeSince } from '@automattic/components';
import { get } from 'lodash';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

import './post-comment.scss'; // yes, this is intentional. they share styles.

interface PostTrackbackProps {
	commentId: number;
	commentsTree: Record< number, PostComment >;
}

interface PostComment {
	data: {
		author: {
			ID: number;
			name: string;
			URL: string;
			wpcom_login: string;
		};
		date: string;
		URL: string;
	};
}

function unescape( str: string ): string {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
}

export default function PostTrackback( props: PostTrackbackProps ): JSX.Element | null {
	const commentsTree = props.commentsTree;
	const comment = get( commentsTree[ props.commentId ], 'data' );
	if ( ! comment ) {
		return null;
	}
	const unescapedAuthorName = unescape( get( comment, 'author.name', '' ) );

	const authorUrlLink = comment.author?.wpcom_login
		? getUserProfileUrl( comment.author.wpcom_login )
		: comment.author?.URL;

	return (
		<li className="comments__comment depth-0">
			<div className="comments__comment-author">
				<div className="comments__comment-trackbackicon">
					<Gridicon icon="link" size={ 24 } />
				</div>

				{ authorUrlLink ? (
					<a
						href={ authorUrlLink }
						target="_blank"
						rel="noopener noreferrer"
						className="comments__comment-username"
					>
						{ unescapedAuthorName }
					</a>
				) : (
					<strong className="comments__comment-username">{ unescapedAuthorName }</strong>
				) }

				<div className="comments__comment-timestamp">
					<a href={ comment.URL }>
						<TimeSince date={ comment.date } />
					</a>
				</div>
			</div>
		</li>
	);
}
