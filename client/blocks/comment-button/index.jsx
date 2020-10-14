/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { isNull, noop, omitBy } from 'lodash';

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
	const { commentCount, href, onClick, showLabel, tagName, target } = props;
	const translate = useTranslate();

	return React.createElement(
		tagName,
		omitBy(
			{
				className: 'comment-button',
				href: 'a' === tagName ? href : null,
				onClick,
				target: 'a' === tagName ? target : null,
			},
			isNull
		),
		<Gridicon icon="comment" size={ props.size } className="comment-button__icon" />,
		<span className="comment-button__label">
			{ commentCount > 0 && <span className="comment-button__label-count">{ commentCount }</span> }
			{ showLabel && commentCount > 0 && (
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

CommentButton.propTypes = {
	commentCount: PropTypes.number,
	href: PropTypes.string,
	onClick: PropTypes.func,
	showLabel: PropTypes.bool,
	tagName: PropTypes.string,
	target: PropTypes.string,
};

CommentButton.defaultProps = {
	commentCount: 0,
	href: null,
	onClick: noop,
	showLabel: true,
	size: 24,
	tagName: 'li',
	target: null,
};

const mapStateToProps = ( state, ownProps ) => {
	const { post: { site_ID: siteId, ID: postId } = {}, commentCount } = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount,
	};
};

export default connect( mapStateToProps )( CommentButton );
