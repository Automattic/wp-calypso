/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import VerticalMenu from '../index';
import { SocialItem } from '../items';

const announceIt = console.log.bind( console );

export const VerticalMenuExample = () => (
	<div className="design-assets__group">
		<h2>
			<a href="/devdocs/design/vertical-menu">Vertical Menu</a>
		</h2>

		<h3>Social Items</h3>
		<VerticalMenu onClick={ announceIt }>
			<SocialItem service="google" />
			<SocialItem service="facebook" />
			<SocialItem service="wordpress" />
			<SocialItem service="linkedin" />
			<SocialItem service="twitter" />
		</VerticalMenu>
	</div>
);

VerticalMenuExample.displayName = 'VerticalMenu';

export default VerticalMenuExample;
