/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isNull, noop, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import { getPostTotalCommentsCount } from 'state/comments/selectors';

class CommentButton extends Component {
	static propTypes = {
		commentCount: PropTypes.number,
		link: PropTypes.string,
		onClick: PropTypes.func,
		showLabel: PropTypes.bool,
		tagName: PropTypes.string,
		target: PropTypes.string,
	};

	static defaultProps = {
		commentCount: 0,
		link: null,
		onClick: noop,
		showLabel: true,
		size: 24,
		tagName: 'li',
		target: null,
	};

	render() {
		const {
			commentCount,
			link,
			onClick,
			showLabel,
			tagName: containerTag,
			target,
			translate,
		} = this.props;

		return React.createElement(
			containerTag,
			omitBy(
				{
					className: 'comment-button',
					href: link,
					onClick,
					target,
				},
				isNull
			),
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />,
			<span className="comment-button__label">
				{ commentCount > 0 && (
					<span className="comment-button__label-count">{ commentCount }</span>
				) }
				{ showLabel &&
				commentCount > 0 && (
					<span className="comment-button__label-status">
						{ translate( 'Comment', 'Comments', {
							context: 'noun',
							count: commentCount,
						} ) }
					</span>
				) }
			</span>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { post: { site_ID: siteId, ID: postId } = {}, commentCount } = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount,
	};
};

export default connect( mapStateToProps )( localize( CommentButton ) );
