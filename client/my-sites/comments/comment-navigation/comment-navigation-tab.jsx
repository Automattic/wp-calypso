/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

export const CommentNavigationTab = ( {
	children,
	className,
	onClick,
} ) =>
	<div className={ classNames( 'comment-navigation__tab', className ) } onClick={ onClick }>
		{ children }
	</div>;

export default CommentNavigationTab;
