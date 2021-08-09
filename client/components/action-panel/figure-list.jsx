import classnames from 'classnames';
import React from 'react';

const ActionPanelFigureList = ( { children, className } ) => {
	return <ul className={ classnames( 'action-panel__figure-list', className ) }>{ children }</ul>;
};

export default ActionPanelFigureList;
