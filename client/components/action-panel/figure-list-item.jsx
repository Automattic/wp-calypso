import classnames from 'classnames';
import React from 'react';

const ActionPanelFigureListItem = ( { children, className } ) => {
	return (
		<li className={ classnames( 'action-panel__figure-list-item', className ) }>{ children }</li>
	);
};

export default ActionPanelFigureListItem;
