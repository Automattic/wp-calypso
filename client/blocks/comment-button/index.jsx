/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { getPostTotalCommentsCount } from 'state/comments/selectors';

export const CommentButton = React.createClass( {

	propTypes: {
		onClick: React.PropTypes.func,
		tagName: React.PropTypes.string,
		size: React.PropTypes.number,
		count: React.PropTypes.number,
		showLabel: React.PropTypes.bool,
		postId: React.PropTypes.number.isRequired,
		siteId: React.PropTypes.number.isRequired
	},

	getDefaultProps() {
		return {
			onClick: noop,
			tagName: 'li',
			size: 24,
			count: 0,
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
		const { count, showLabel, size, tagName: containerTag } = this.props;

		if ( count === 0 ) {
			label = this.translate( 'Comment' );
		} else {
			label = this.translate(
				'Comment',
				'Comments', {
					count: count,
				}
			);
		}

		const labelElement = ( <span className="comment-button__label">
			{ count > 0 ? <span className="comment-button__label-count">{ count }</span> : null }
			{ showLabel && <span className="comment-button__label-status">{ label }</span> }
		</span> );

		return React.createElement(
			containerTag, {
				className: classNames( {
					'comment-button': true,
					'is-empty': count === 0
				} ),
				onTouchTap: this.onTap,
				onClick: this.onClick
			},
			<Gridicon icon="comment" size={ size } className="comment-button__icon" />, labelElement
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId, postId } = ownProps,
		count = getPostTotalCommentsCount( state, siteId, postId );
	if(count === undefined) {
		return {};
	}
	return { count };
} )( CommentButton );
