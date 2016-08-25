/***
 * External dependencies
 */
import React from 'react';

/***
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import PostTime from 'reader/post-time';

function unescape( str ) {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
}

export default class PostTrackback extends React.Component {
	render() {
		const commentsTree = this.props.commentsTree;
		const comment = commentsTree.getIn( [ this.props.commentId, 'data' ] ).toJS();
		const unescapedAuthorName = unescape( comment.author.name );

		return (
			<li className={ 'comments__comment depth-0' }>
				<div className="comments__comment-author">
					<div className="comments__comment-trackbackicon">
						<Gridicon icon="link" size={ 24 } />
					</div>

					{ comment.author.URL
						? <a href={ comment.author.URL } target="_blank" rel="noopener noreferrer" className="comments__comment-username">{ unescapedAuthorName }<Gridicon icon="external" /></a>
						: <strong className="comments__comment-username">{ unescapedAuthorName }</strong> }

					<small className="comments__comment-timestamp">
						<a href={ comment.URL }>
							<PostTime date={ comment.date } />
						</a>
					</small>
				</div>

			</li>
		);
	}
}

PostTrackback.propTypes = {
	commentId: React.PropTypes.number
};
