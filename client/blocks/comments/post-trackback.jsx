/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import TimeSince from 'calypso/components/time-since';

/**
 * Style dependencies
 */
import './post-comment.scss'; // yes, this is intentional. they share styles.

function unescape( str ) {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
}

export default class PostTrackback extends React.Component {
	render() {
		const commentsTree = this.props.commentsTree;
		const comment = get( commentsTree[ this.props.commentId ], 'data' );
		if ( ! comment ) {
			return null;
		}
		const unescapedAuthorName = unescape( get( comment, 'author.name', '' ) );

		return (
			<li className={ 'comments__comment depth-0' }>
				<div className="comments__comment-author">
					<div className="comments__comment-trackbackicon">
						<Gridicon icon="link" size={ 24 } />
					</div>

					{ get( comment, 'author.URL' ) ? (
						<a
							href={ comment.author.URL }
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
}

PostTrackback.propTypes = {
	commentId: PropTypes.number,
	commentsTree: PropTypes.object,
};
