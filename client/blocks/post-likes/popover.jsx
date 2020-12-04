/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { omit } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'calypso/components/popover';
import PostLikes from './index';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';
import { countPostLikes } from 'calypso/state/posts/selectors/count-post-likes';

/**
 * Style dependencies
 */
import './popover.scss';

function PostLikesPopover( props ) {
	const {
		className,
		siteId,
		postId,
		showDisplayNames,
		context,
		onClose,
		likes,
		likeCount,
		onMouseEnter,
		onMouseLeave,
	} = props;

	// Whenever our `Popover` content changes size (loading, complete, siteId,
	// or postId, for example), we need to force the `Popover` to re-render and
	// re-compute its position.  The `Popover` component is not really designed
	// for this, so the easiest way is to force it to unmount and remount.
	// This is achieved by setting a different `key` whenever our data changes.
	const popoverKey = [
		'likes',
		siteId,
		postId,
		showDisplayNames ? 'large' : 'small',
		likes ? likes.length : 0,
		likeCount,
	].join( '-' );

	const popoverProps = omit(
		props,
		'className',
		'siteId',
		'postId',
		'showDisplayNames',
		'context',
		'onClose',
		'likes',
		'onMouseEnter',
		'onMouseLeave'
	);
	const classes = classnames( 'post-likes-popover', className );
	const postLikesProps = { siteId, postId, showDisplayNames, onMouseEnter, onMouseLeave };

	return (
		<Popover
			{ ...popoverProps }
			className={ classes }
			isVisible
			context={ context }
			onClose={ onClose }
			key={ popoverKey }
		>
			<PostLikes { ...postLikesProps } />
		</Popover>
	);
}

export default connect( ( state, ownProps ) => {
	const { siteId, postId } = ownProps;

	return {
		likeCount: countPostLikes( state, siteId, postId ),
		likes: getPostLikes( state, siteId, postId ),
	};
} )( PostLikesPopover );
