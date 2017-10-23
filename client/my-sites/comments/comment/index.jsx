/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export class Comment extends Component {
	static defaultProps = {
		isLoading: false,
	};

	state = {
		isEditMode: false,
		isExpanded: false,
	};

	storeCardRef = card => {
		this.commentCard = card;
	};

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
		const classes = classNames( 'comment' );

		return (
			<Card
				className={ classes }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
				tabIndex="0"
			>
				<div>Comment Card</div>
			</Card>
		);
	}
}

export default Comment;
