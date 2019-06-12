/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import ExternalLink from 'components/external-link';

/**
 * Internal dependencies
 */
import WooCommerceLogo from '../woocommerce-logo';

const WooCommerceColophon = ( { translate } ) => {
	return (
		<div className="woocommerce-colophon">
			<ExternalLink icon={ false } href="https://woocommerce.com">
				{ translate( 'Powered by {{WooCommerceLogo /}}', {
					components: {
						WooCommerceLogo: <WooCommerceLogo height={ 32 } width={ 120 } />,
					},
				} ) }
			</ExternalLink>
		</div>
	);
};

export default localize( WooCommerceColophon );
