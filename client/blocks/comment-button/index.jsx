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

const CommentButton = React.createClass( {

	propTypes: {
		onClick: React.PropTypes.func,
		tagName: React.PropTypes.string,
		size: React.PropTypes.number,
		commentCount: React.PropTypes.number,
		showLabel: React.PropTypes.bool,
		postId: React.PropTypes.number.isRequired,
		siteId: React.PropTypes.number.isRequired
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
			commentCount = ( this.props.syncedCount === undefined ? this.props.commentCount : this.props.syncedCount );

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
				className: classNames( {
					'comment-button': true,
					'is-empty': commentCount === 0
				} ),
				onTouchTap: this.onTap,
				onClick: this.onClick
			},
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />, labelElement
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId, postId } = ownProps,
		syncedCount = getPostTotalCommentsCount( state, siteId, postId );

	return { syncedCount };
} )( CommentButton );

export { CommentButton as PureCommentButton };
