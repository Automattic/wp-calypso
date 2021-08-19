import classNames from 'classnames';
import React from 'react';

export const CommentNavigationTab = ( { children, className } ) => (
	<div className={ classNames( 'comment-navigation__tab', className ) }>{ children }</div>
);

export default CommentNavigationTab;
