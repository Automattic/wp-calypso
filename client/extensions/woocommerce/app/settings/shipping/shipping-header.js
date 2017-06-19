/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';

const ShippingHeader = ( { translate } ) => {
	return (
		<ActionHeader>
			<Button primary>{ translate( 'Save' ) }</Button>
		</ActionHeader>
	);
};

export default localize( ShippingHeader );
