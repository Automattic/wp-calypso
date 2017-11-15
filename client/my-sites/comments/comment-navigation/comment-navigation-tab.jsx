/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

export const CommentNavigationTab = ( { children, className, onClick } ) => (
	<div className={ classNames( 'comment-navigation__tab', className ) } onClick={ onClick }>
		{ children }
	</div>
);

export default CommentNavigationTab;
