/** @format */

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
import Popover from 'components/popover';
import PostLikes from './index';
import { getPostLikes } from 'state/selectors';

function PostLikesPopover( props ) {
	const { className, siteId, postId, showDisplayNames, context, onClose, likes } = props;

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
		likes ? likes.length : 'null',
	].join( '-' );

	const popoverProps = omit(
		props,
		'className',
		'siteId',
		'postId',
		'showDisplayNames',
		'context',
		'onClose',
		'likes'
	);
	const classes = classnames( 'post-likes-popover', className );

	return (
		<Popover
			{ ...popoverProps }
			className={ classes }
			isVisible={ true }
			context={ context }
			onClose={ onClose }
			key={ popoverKey }
		>
			<PostLikes siteId={ siteId } postId={ postId } showDisplayNames={ showDisplayNames } />
		</Popover>
	);
}

export default connect( ( state, ownProps ) => {
	const { siteId, postId } = ownProps;

	return {
		likes: getPostLikes( state, siteId, postId ),
	};
} )( PostLikesPopover );
