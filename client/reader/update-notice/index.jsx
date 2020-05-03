/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop, filter, get, flatMap } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors';
import { getCommentById } from 'state/comments/selectors';
import { getStream } from 'state/reader/streams/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class UpdateNotice extends React.PureComponent {
	static propTypes = {
		streamKey: PropTypes.string,
		onClick: PropTypes.func,
		cappedUnreadCount: PropTypes.string,
	};

	static defaultProps = { onClick: noop };

	render() {
		const { count, cappedUnreadCount, translate } = this.props;

		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': count > 0,
		} );

		return (
			<button className={ counterClasses } onClick={ this.handleClick }>
				<DocumentHead unreadCount={ count } />
				<Gridicon icon="arrow-up" size={ 18 } />
				{ translate( '%s new post', '%s new posts', {
					args: [ cappedUnreadCount ],
					count,
					comment: '%s is the number of new posts. For example: "1" or "40+"',
				} ) }
			</button>
		);
	}

	handleClick = ( event ) => {
		event.preventDefault();
		this.props.onClick();
	};
}

const countNewComments = ( state, postKeys ) => {
	const newComments = flatMap( postKeys, ( postKey ) => {
		return filter( postKey.comments, ( commentId ) => {
			return ! getCommentById( {
				state,
				siteId: postKey.blogId,
				commentId: commentId,
			} );
		} );
	} );
	return newComments.length;
};

const mapStateToProps = ( state, ownProps ) => {
	const stream = getStream( state, ownProps.streamKey );
	const pendingItems = stream.pendingItems.items;
	const updateCount = stream.pendingItems.items.length;

	// ugly hack for convos
	const isConversations = !! get( pendingItems, [ 0, 'comments' ] );
	const count = isConversations ? countNewComments( state, pendingItems ) : updateCount;

	return {
		cappedUnreadCount: getDocumentHeadCappedUnreadCount( state ),
		count,
	};
};

export default connect( mapStateToProps )( localize( UpdateNotice ) );
