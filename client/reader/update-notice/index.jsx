/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop, filter, get, flatMap } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getCommentById } from 'state/comments/selectors';
import { getDocumentHeadTitle } from 'state/document-head/selectors';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import getStream from 'state/selectors/get-reader-stream';

const UNREAD_COUNT_CAP = 40;

class UpdateNotice extends React.PureComponent {
	static propTypes = {
		streamKey: PropTypes.string,
		onClick: PropTypes.func,
	};

	static defaultProps = { onClick: noop };

	componentDidMount() {
		this.setCount();
	}

	componentDidUpdate() {
		this.setCount();
	}

	setCount = () => {
		const { count, documentTitle } = this.props;
		if ( ! count ) {
			return;
		}
		// Replace e.g. a leading `(3) ` with a leading `(4) `.
		// If there's currently no `(3) `, just prepend the current title with `(4) `.
		const title = documentTitle.replace( /^(\(\d+\+?\) )?/, `(${ this.countString() }) ` );
		this.props.setDocumentHeadTitle( title );
	};

	countString = () => {
		const { count } = this.props;
		return count <= UNREAD_COUNT_CAP ? String( count ) : `${ UNREAD_COUNT_CAP }+`;
	};

	render() {
		const { count } = this.props;

		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': count > 0,
		} );

		return (
			<div className={ counterClasses } onClick={ this.handleClick }>
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.props.translate( '%s new post', '%s new posts', {
					args: [ this.countString() ],
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

const countNewComments = ( state, postKeys ) => {
	const newComments = flatMap( postKeys, postKey => {
		return filter( postKey.comments, commentId => {
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

	return { count, documentTitle: getDocumentHeadTitle( state ) };
};

export default connect( mapStateToProps, { setDocumentHeadTitle } )( localize( UpdateNotice ) );
