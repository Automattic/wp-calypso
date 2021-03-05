/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const ActionPanelLink = ( { children, href, className } ) => {
	return (
		<a href={ href } className={ classnames( 'action-panel__body-text-link', className ) }>
			{ children }
		</a>
	);
};

export default ActionPanelLink;
