/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ActionPanelCta from './cta';

const ActionPanelFooter = ( { children } ) => {
	return <ActionPanelCta className="action-panel__footer">{ children }</ActionPanelCta>;
};

export default ActionPanelFooter;
