import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { omitBy } from 'lodash';
import PropTypes from 'prop-types';
import { createElement } from 'react';
import { connect } from 'react-redux';
import { getPostTotalCommentsCount } from 'calypso/state/comments/selectors';

import './style.scss';

const noop = () => {};

function CommentButton( {
	commentCount = 0,
	href = null,
	onClick = noop,
	size = 24,
	tagName = 'li',
	target = null,
	icon = null,
	defaultLabel,
} ) {
	const showLabel = commentCount > 0 || defaultLabel;
	const label = commentCount || defaultLabel;

	return createElement(
		tagName,
		omitBy(
			{
				className: 'comment-button',
				href: 'a' === tagName ? href : null,
				onClick,
				target: 'a' === tagName ? target : null,
				title: translate( 'Comment' ),
			},
			( prop ) => prop === null
		),
		icon || <Gridicon icon="comment" size={ size } className="comment-button__icon" />,
		<span className="comment-button__label">
			{ showLabel && <span className="comment-button__label-count">{ label }</span> }
		</span>
	);
}

CommentButton.propTypes = {
	commentCount: PropTypes.number,
	href: PropTypes.string,
	onClick: PropTypes.func,
	post: PropTypes.object,
	tagName: PropTypes.string,
	target: PropTypes.string,
	icon: PropTypes.object,
	defaultLabel: PropTypes.string,
};

const mapStateToProps = ( state, ownProps ) => {
	const { post: { site_ID: siteId, ID: postId } = {}, commentCount } = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount,
	};
};

export default connect( mapStateToProps )( CommentButton );
