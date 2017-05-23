/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export const CommentNavigationButton = ( {
	children,
	onClick,
} ) =>
	<div className="comment-navigation__button">
		<Button compact onClick={ onClick }>
			{ children }
		</Button>
	</div>;

export default CommentNavigationButton;
