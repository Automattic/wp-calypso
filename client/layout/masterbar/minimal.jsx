/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import Masterbar from './masterbar';

/**
 * Internal dependencies
 */
import Item from './item';

const MasterbarMinimal = ( { url, children } ) => (
	<Masterbar>
		<Item url={ url } icon="my-sites" className="masterbar__item-logo">
			WordPress<span className="tld">.com</span>
		</Item>
		{ children }
	</Masterbar>
);

MasterbarMinimal.propTypes = {
	url: React.PropTypes.string.isRequired,
	children: React.PropTypes.node,
};

export default MasterbarMinimal;
