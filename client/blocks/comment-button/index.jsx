import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getPostTotalCommentsCount } from 'calypso/state/comments/selectors';

import './style.scss';

function CommentButton( {
	commentCount = 0,
	size = 24,
	tagName: TagName = 'li',
	onClick,
	href,
	target,
	icon,
	defaultLabel,
	alwaysShowTooltip = false,
} ) {
	const translate = useTranslate();
	const showLabel = commentCount > 0 || defaultLabel;
	const label = commentCount || defaultLabel;
	// Show a tooltip when there are existing comments, or when explicitly requested.
	const showTooltip = commentCount > 0 || alwaysShowTooltip;

	return (
		<TagName
			className={ clsx( 'comment-button', {
				tooltip: showTooltip,
			} ) }
			aria-label={ translate( 'Comment' ) }
			data-tooltip={ showTooltip ? translate( 'Comment' ) : undefined }
			onClick={ onClick }
			href={ 'a' === TagName ? href : undefined }
			target={ 'a' === TagName ? target : undefined }
		>
			{ icon || <Gridicon icon="comment" size={ size } className="comment-button__icon" /> }
			{ showLabel && (
				<span className="comment-button__label">
					<span className="comment-button__label-count">{ label }</span>
				</span>
			) }
		</TagName>
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
	alwaysShowTooltip: PropTypes.bool,
};

const mapStateToProps = ( state, ownProps ) => {
	const { post: { site_ID: siteId, ID: postId } = {}, commentCount } = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount,
	};
};

export default connect( mapStateToProps )( CommentButton );
