import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { filter, get, flatMap } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { getCommentById } from 'calypso/state/comments/selectors';
import { getDocumentHeadCappedUnreadCount } from 'calypso/state/document-head/selectors/get-document-head-capped-unread-count';
import { getStream } from 'calypso/state/reader/streams/selectors';
import './style.scss';

const noop = () => {};

class UpdateNotice extends PureComponent {
	static propTypes = {
		streamKey: PropTypes.string,
		onClick: PropTypes.func,
		cappedUnreadCount: PropTypes.string,
	};

	static defaultProps = { onClick: noop };

	render() {
		const { count, cappedUnreadCount, translate } = this.props;

		const counterClasses = clsx( {
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
