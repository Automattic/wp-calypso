/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { getPostTotalCommentsCount } from 'calypso/state/comments/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function CommentButton( props ) {
	const { commentCount, href, onClick, size, target } = props;
	const translate = useTranslate();

	return (
		<a className="comment-button" href={ href } onClick={ onClick } target={ target }>
			<Gridicon aria-hidden="true" icon="comment" size={ size } className="comment-button__icon" />
			<span className="comment-button__label">
				{ commentCount > 0 && (
					<span className="comment-button__label-count">{ commentCount }</span>
				) }
				{ commentCount > 0 && (
					<span className="comment-button__label-status">
						{ translate( 'Comment', 'Comments', {
							context: 'noun',
							count: commentCount,
						} ) }
					</span>
				) }
			</span>
		</a>
	);
}

CommentButton.propTypes = {
	commentCount: PropTypes.number,
	href: PropTypes.string,
	onClick: PropTypes.func,
	target: PropTypes.string,
};

CommentButton.defaultProps = {
	commentCount: 0,
	href: null,
	onClick: noop,
	size: 24,
	target: null,
};

const mapStateToProps = ( state, ownProps ) => {
	const { post: { site_ID: siteId, ID: postId } = {}, commentCount } = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount,
	};
};

export default connect( mapStateToProps )( CommentButton );
