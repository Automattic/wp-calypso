/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentHeader from 'my-sites/comments/comment/comment-header';

export class Comment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
		isLoading: PropTypes.bool,
		isSelected: PropTypes.bool,
	};

	static defaultProps = {
		isBulkMode: false,
		isLoading: false,
		isSelected: false,
	};

	state = {
		isEditMode: false,
		isExpanded: false,
	};

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
		const { commentId, isBulkMode, isSelected } = this.props;
		const { isEditMode, isExpanded } = this.state;

		const classes = classNames( 'comment', {
			'is-bulk-mode': isBulkMode,
			'is-collapsed': ! isExpanded && ! isBulkMode,
			'is-expanded': isExpanded,
		} );

		return (
			<Card
				className={ classes }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
				tabIndex="0"
			>
				{ ! isEditMode && (
					<div className="comment__detail">
						<CommentHeader
							{ ...{ commentId, isBulkMode, isEditMode, isExpanded, isSelected } }
							toggleExpanded={ this.toggleExpanded }
						/>
					</div>
				) }
			</Card>
		);
	}
}

export default Comment;
