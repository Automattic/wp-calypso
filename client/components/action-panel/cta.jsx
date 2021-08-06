import classNames from 'classnames';
import React from 'react';

const ActionPanelCta = ( { children, className } ) => {
	return <div className={ classNames( 'action-panel__cta', className ) }>{ children }</div>;
};

export default ActionPanelCta;
