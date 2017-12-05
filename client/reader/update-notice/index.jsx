/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop, filter, forEach, get } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors';
import { getCommentById } from 'state/comments/selectors';

class UpdateNotice extends React.PureComponent {
	static propTypes = {
		count: PropTypes.number.isRequired,
		onClick: PropTypes.func,
		pendingPostKeys: PropTypes.array,
		// connected props
		cappedUnreadCount: PropTypes.string,
	};

	static defaultProps = { onClick: noop };

	render() {
		const isConversations = get( this.props, [ 'pendingPostKeys', 0, 'comments' ] );
		let { count } = this.props;
		const { pendingPostKeys } = this.props;

		// ugly hack for conversations to hide the pill if none of the comments
		// are actually new
		if ( isConversations ) {
			let newComments = 0;
			forEach( pendingPostKeys, postKey => {
				if ( postKey.comments ) {
					const commentsToKeep = filter( postKey.comments, commentId => {
						const c = getCommentById( {
							state: this.props.state,
							siteId: postKey.blogId,
							commentId: commentId,
						} );
						return ! c;
					} );

					if ( commentsToKeep.length > 0 ) {
						newComments += commentsToKeep.length;
					}
				}
			} );
			if ( newComments === 0 ) {
				return null;
			}
			count = newComments;
		}

		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': this.props.count > 0,
		} );

		return (
			<div className={ counterClasses } onClick={ this.handleClick }>
				<DocumentHead unreadCount={ count } />
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.props.translate( '%s new post', '%s new posts', {
					args: [ this.props.cappedUnreadCount ],
					count,
				} ) }
			</div>
		);
	}

	handleClick = event => {
		event.preventDefault();
		this.props.onClick();
	};
}

export default connect( state => ( {
	cappedUnreadCount: getDocumentHeadCappedUnreadCount( state ),
	state,
} ) )( localize( UpdateNotice ) );
