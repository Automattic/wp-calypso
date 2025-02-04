import { Gridicon } from '@automattic/components';
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
} ) {
	const translate = useTranslate();
	const showLabel = commentCount > 0 || defaultLabel;
	const label = commentCount || defaultLabel;

	return (
		<TagName
			className="comment-button tooltip"
			data-tooltip={ translate( 'Comment' ) }
			onClick={ onClick }
			href={ 'a' === TagName ? href : undefined }
			target={ 'a' === TagName ? target : undefined }
		>
			{ icon || <Gridicon icon="comment" size={ size } className="comment-button__icon" /> }
			<span className="comment-button__label">
				{ showLabel && <span className="comment-button__label-count">{ label }</span> }
			</span>
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
};

const mapStateToProps = ( state, ownProps ) => {
	const { post: { site_ID: siteId, ID: postId } = {}, commentCount } = ownProps;

	return {
		commentCount: getPostTotalCommentsCount( state, siteId, postId ) || commentCount,
	};
};

export default connect( mapStateToProps )( CommentButton );
