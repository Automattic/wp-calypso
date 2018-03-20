/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import WooCommerceLogo from '../woocommerce-logo';

const WooCommerceColophon = ( { translate } ) => {
	return (
		<div className="woocommerce-colophon">
			<span>
				{ translate( 'Powered by {{WooCommerceLogo /}}', {
					components: {
						WooCommerceLogo: <WooCommerceLogo height={ 32 } width={ 120 } />,
					},
				} ) }
			</span>
		</div>
	);
};

export default localize( WooCommerceColophon );
