import { useTranslate } from 'i18n-calypso';
import { omitBy } from 'lodash';
import PropTypes from 'prop-types';
import { createElement } from 'react';
import { connect } from 'react-redux';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import { getPostTotalCommentsCount } from 'calypso/state/comments/selectors';

import './style.scss';

const noop = () => {};

function ReaderCommentButton( props ) {
	const { commentCount, href, onClick, showLabel, tagName, target, size } = props;
	const translate = useTranslate();

	return createElement(
		tagName,
		omitBy(
			{
				className: 'comment-button',
				href: 'a' === tagName ? href : null,
				onClick,
				target: 'a' === tagName ? target : null,
			},
			( prop ) => prop === null
		),
		ReaderCommentIcon( {
			iconSize: size,
		} ),
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

ReaderCommentButton.propTypes = {
	commentCount: PropTypes.number,
	href: PropTypes.string,
	onClick: PropTypes.func,
	showLabel: PropTypes.bool,
	tagName: PropTypes.string,
	target: PropTypes.string,
};

ReaderCommentButton.defaultProps = {
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

export default connect( mapStateToProps )( ReaderCommentButton );
