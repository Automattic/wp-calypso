/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

export const CommentNavigationTab = ( { children, className } ) => (
	<div className={ classNames( 'comment-navigation__tab', className ) }>{ children }</div>
);

export default CommentNavigationTab;
