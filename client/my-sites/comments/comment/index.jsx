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
import QueryComment from 'components/data/query-comment';
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
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkMode && ! this.props.isBulkMode ) {
			this.setState( { isExpanded: false } );
		}
	}

	storeCardRef = card => ( this.commentCard = card );

	keyDownHandler = event => {
		const commentHasFocus =
			document &&
			this.commentCard &&
			document.activeElement === ReactDom.findDOMNode( this.commentCard );
		if ( this.state.isEditMode || ( this.state.isExpanded && ! commentHasFocus ) ) {
			return;
		}
		switch ( event.keyCode ) {
			case 32: // space
			case 13: // enter
				event.preventDefault();
				this.toggleExpanded();
				break;
		}
	};

	toggleExpanded = () => {
		if ( ! this.props.isLoading && ! this.state.isEditMode ) {
			this.setState( ( { isExpanded } ) => ( { isExpanded: ! isExpanded } ) );
		}
	};

	render() {
		const {
			commentId,
			commentStatus,
			isBulkMode,
			isLoading,
			isSelected,
			refreshCommentData,
			siteId,
			toggleSelected,
		} = this.props;
		const { isEditMode, isExpanded } = this.state;

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
							{ ...{ commentId, isBulkMode, isEditMode, isExpanded, isSelected, toggleSelected } }
							toggleExpanded={ this.toggleExpanded }
						/>

						<CommentContent { ...{ commentId, isExpanded } } />
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
		siteId,
	};
};

export default connect( mapStateToProps )( Comment );
