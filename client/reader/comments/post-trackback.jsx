/***
 * External Dependencies
 */
import React from 'react';

/***
 * Internal Dependencies
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

		return (
			<li className={ 'comment depth-0' }>
				<div className="comment__author">
					<div className="comment__trackbackicon">
						<Gridicon icon="link" size={ 24 } />
					</div>

					{ comment.author.URL
						? <a href={ comment.author.URL } target="_blank" className="comment__username">{ unescape( comment.author.name ) }<Gridicon icon="external" /></a>
						: <strong className="comment__username">{ unescape( comment.author.name ) }</strong> }

					<small className="comment__timestamp">
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
