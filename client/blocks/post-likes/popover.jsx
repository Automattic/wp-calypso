/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import PostLikes from './index';

export default function PostLikesPopover( props ) {
	const { context, siteId, postId, onClose } = props;

	const popoverProps = omit( props, 'className', 'context', 'siteId', 'postId', 'onClose' );
	const classes = classnames( 'post-likes-popover', props.className );

	return (
		<Popover
			{ ...popoverProps }
			className={ classes }
			isVisible={ true }
			context={ context }
			onClose={ onClose }
		>
			<PostLikes siteId={ siteId } postId={ postId } />
		</Popover>
	);
}
