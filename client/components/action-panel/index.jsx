/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

/**
 * Style dependencies
 */
import './style.scss';

const ActionPanel = ( { children } ) => {
	return <Card className="action-panel">{ children }</Card>;
};

export default ActionPanel;
