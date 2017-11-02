/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactDom from 'react-dom';
import { get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentContent from 'my-sites/comments/comment/comment-content';
import CommentHeader from 'my-sites/comments/comment/comment-header';
import CommentReply from 'my-sites/comments/comment/comment-reply';
import QueryComment from 'components/data/query-comment';
import { getMinimumComment } from 'my-sites/comments/comment/utils';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class Comment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
		isSelected: PropTypes.bool,
		refreshCommentData: PropTypes.bool,
		toggleSelected: PropTypes.func,
	};

	static defaultProps = {
		isBulkMode: false,
		isSelected: false,
	};

	state = {
		isEditMode: false,
		isExpanded: false,
		isReplyMode: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkMode && ! this.props.isBulkMode ) {
			this.setState( { isExpanded: false } );
		}
	}

	storeCardRef = card => ( this.commentCard = card );

	enterReplyMode = () => this.setState( { isReplyMode: true } );

	exitReplyMode = () => this.setState( { isReplyMode: false } );

	keyDownHandler = event => {
		const { isBulkMode } = this.props;
		const { isEditMode, isExpanded } = this.state;

		const commentHasFocus =
			document &&
			this.commentCard &&
			document.activeElement === ReactDom.findDOMNode( this.commentCard );

		if ( isEditMode || ( isExpanded && ! commentHasFocus ) ) {
			return;
		}

		switch ( event.keyCode ) {
			case 13: // enter
			case 32: // space
				event.preventDefault();
				return isBulkMode ? this.toggleSelected() : this.toggleExpanded();
		}
	};

	toggleExpanded = () => {
		if ( ! this.props.isLoading && ! this.state.isEditMode ) {
			this.setState( ( { isExpanded } ) => ( { isExpanded: ! isExpanded } ) );
		}
	};

	toggleSelected = () => this.props.toggleSelected( this.props.minimumComment );

	render() {
		const {
			commentId,
			commentStatus,
			isBulkMode,
			isLoading,
			isSelected,
			refreshCommentData,
			siteId,
		} = this.props;
		const { isEditMode, isExpanded, isReplyMode } = this.state;

		const classes = classNames( 'comment', {
			'is-bulk-mode': isBulkMode,
			'is-collapsed': ! isExpanded && ! isBulkMode,
			'is-expanded': isExpanded,
			'is-placeholder': isLoading,
			'is-unapproved': 'unapproved' === commentStatus,
		} );

		return (
			<Card
				className={ classes }
				onClick={ isBulkMode ? this.toggleSelected : false }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
				tabIndex="0"
			>
				{ refreshCommentData && (
					<QueryComment commentId={ commentId } siteId={ siteId } forceWpcom />
				) }

				{ ! isEditMode && (
					<div className="comment__detail">
						<CommentHeader
							{ ...{ commentId, isBulkMode, isEditMode, isExpanded, isSelected } }
							toggleExpanded={ this.toggleExpanded }
						/>

						<CommentContent { ...{ commentId, isExpanded } } />

						{ isExpanded && (
							<CommentReply
								{ ...{ commentId, isReplyMode } }
								enterReplyMode={ this.enterReplyMode }
								exitReplyMode={ this.exitReplyMode }
							/>
						) }
					</div>
				) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	return {
		commentStatus: get( comment, 'status' ),
		isLoading: isUndefined( comment ),
		minimumComment: getMinimumComment( comment ),
		siteId,
	};
};

export default connect( mapStateToProps )( Comment );
