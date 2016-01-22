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

const MasterbarMinimal = ( { url } ) => (
	<Masterbar>
		<Item url={ url } icon="my-sites" className="masterbar__item-logo">
			WordPress<span className="tld">.com</span>
		</Item>
	</Masterbar>
);

MasterbarMinimal.propTypes = {
	url: React.PropTypes.string.isRequired
};

export default MasterbarMinimal;
