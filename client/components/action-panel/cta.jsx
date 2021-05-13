/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

const ActionPanelCta = ( { children, className } ) => {
	return <div className={ classNames( 'action-panel__cta', className ) }>{ children }</div>;
};

export default ActionPanelCta;
