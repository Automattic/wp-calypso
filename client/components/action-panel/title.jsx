/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const ActionPanelTitle = ( { children, className } ) => {
	return <h2 className={ classnames( 'action-panel__title', className ) }>{ children }</h2>;
};

export default ActionPanelTitle;
