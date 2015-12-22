/**
 * External dependencies
 */
import React from 'react';
import Masterbar from './masterbar';

/**
 * Internal dependencies
 */
import Item from './item';

export default () => (
	<Masterbar collapsible={ false } >
		<Item url="/" icon="my-sites" className="masterbar__item-logo">
			WordPress<span className="tld">.com</span>
		</Item>
	</Masterbar>
);
