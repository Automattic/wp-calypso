/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const ActionPanelFigureList = ( { children, className } ) => {
	return <ul className={ classnames( 'action-panel__figure-list', className ) }>{ children }</ul>;
};

export default ActionPanelFigureList;
