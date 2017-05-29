/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';

const OrderHeader = ( { translate, siteSlug } ) => {
	const addLink = `/store/orders/${ siteSlug }/add`;

	return (
		<ActionHeader>
			<Button primary href={ addLink }>{ translate( 'Add Order' ) }</Button>
		</ActionHeader>
	);
};

export default localize( OrderHeader );
