/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const ActionPanel = ( { children, className } ) => {
	return <Card className={ classnames( 'action-panel', className ) }>{ children }</Card>;
};

export default ActionPanel;
