/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const ActionPanel = ( { children } ) => {
	return <Card className="settings-action-panel">{ children }</Card>;
};

export default ActionPanel;
