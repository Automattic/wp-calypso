/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */

import { BlockInspector } from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';

function Inspector() {
	return (
		<Popover position="bottom" className="iso-inspector">
			<BlockInspector />
		</Popover>
	);
}

export default Inspector;
