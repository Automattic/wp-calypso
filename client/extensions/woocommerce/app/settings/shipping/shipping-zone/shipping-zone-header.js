/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';

const ShippingZoneHeader = ( { translate } ) => {
	return (
		<ActionHeader>
			<Button borderless><Gridicon icon="trash" /></Button>
			<Button primary>{ translate( 'Save' ) }</Button>
		</ActionHeader>
	);
};

export default localize( ShippingZoneHeader );
