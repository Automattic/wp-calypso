/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import Gridicon from 'gridicons';

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

	render() {
		let label;
		const containerTag = this.props.tagName,
			commentCount = this.props.commentCount,
			commentCountComponent = <span className="comment-button__label-count">
				{ commentCount }
			</span>;

		if ( commentCount === 0 ) {
			label = <span className="comment-button__label-status">
				{ this.translate( 'Comment', { context: 'verb' } ) }
			</span>;
		} else {
			label = this.translate(
				'{{count/}}{{span}}Comment{{/span}}',
				'{{count/}}{{span}}Comments{{/span}}', {
					components: {
						count: commentCountComponent,
						span: <span className="comment-button__label-status" />
					},
					count: commentCount,
				}
			);
		}

		// If the label is to be shown, output the label from above,
		// otherwise just show the count if it's > 0.
		const labelElement = ( <span className="comment-button__label">
			{ this.props.showLabel ? label : commentCount > 0 && commentCountComponent }
		</span> );

		return React.createElement(
			containerTag, {
				className: 'comment-button',
				onClick: this.props.onClick
			},
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />, labelElement
		);
	}
} );

export default CommentButton;
