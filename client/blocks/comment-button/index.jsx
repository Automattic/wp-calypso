/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const CommentButton = React.createClass( {

	propTypes: {
		onClick: React.PropTypes.func,
		tagName: React.PropTypes.string,
		commentCount: React.PropTypes.number,
		showLabel: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			onClick: noop,
			tagName: 'li',
			size: 24,
			commentCount: 0,
			showLabel: true
		};
	},

	onClick( event ) {
		event.preventDefault();
	},

	onTap() {
		this.props.onClick();
	},

	render() {
		let label;
		const containerTag = this.props.tagName,
			commentCount = this.props.commentCount;

		if ( commentCount === 0 ) {
			label = this.translate( 'Comment' );
		} else {
			label = this.translate(
				'Comment',
				'Comments', {
					count: commentCount,
				}
			);
		}

		const labelElement = ( <span className="comment-button__label">
			{ commentCount > 0 ? <span className="comment-button__label-count">{ commentCount }</span> : null }
			{ this.props.showLabel && <span className="comment-button__label-status">{ label }</span> }
		</span> );

		return React.createElement(
			containerTag, {
				className: 'comment-button',
				onTouchTap: this.onTap,
				onClick: this.onClick
			},
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />, labelElement
		);
	}
} );

export default CommentButton;
