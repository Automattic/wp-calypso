/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const ActionPanelFigureListItem = ( { children, className } ) => {
	return (
		<li className={ classnames( 'action-panel__figure-list-item', className ) }>{ children }</li>
	);
};

export default ActionPanelFigureListItem;
