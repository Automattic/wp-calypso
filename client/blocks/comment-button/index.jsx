/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPostTotalCommentsCount } from 'state/comments/selectors';

class CommentButton extends Component {

	static propTypes = {
		onClick: PropTypes.func,
		tagName: PropTypes.string,
		commentCount: PropTypes.number,
		showLabel: PropTypes.bool
	};

	static defaultProps = {
		onClick: noop,
		tagName: 'li',
		size: 24,
		commentCount: 0,
		showLabel: true
	};

	render() {
		const {
			translate,
			commentCount,
			onClick,
			showLabel,
			tagName: containerTag,
		} = this.props;

		return React.createElement(
			containerTag, {
				className: 'comment-button',
				onClick
			},
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />,
			<span className="comment-button__label">
				{ commentCount > 0 &&
					<span className="comment-button__label-count">{ commentCount }</span>
				}
				{ showLabel && commentCount > 0 &&
					<span className="comment-button__label-status">
						{ translate( 'Comment', 'Comments', {
							context: 'noun',
							count: commentCount,
						} ) }
					</span>
				}
			</span>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const {
		post: {
			site_ID: siteId,
			ID: postId,
		} = {},
		commentCount,
	} = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount
	};
};

export default connect( mapStateToProps )( localize( CommentButton ) );
