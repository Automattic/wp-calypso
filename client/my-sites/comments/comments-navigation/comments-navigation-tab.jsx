/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

export const CommentsNavigationTab = ( { children, className, onClick } ) => (
	<div className={ classNames( 'comment-navigation__tab', className ) } onClick={ onClick }>
		{ children }
	</div>
);

export default CommentsNavigationTab;
