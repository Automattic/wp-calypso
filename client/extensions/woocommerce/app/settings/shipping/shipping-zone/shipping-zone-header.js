/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';

const ShippingZoneHeader = ( { onSave, translate } ) => {
	return (
		<ActionHeader>
			<Button borderless><Gridicon icon="trash" /></Button>
			<Button primary onClick={ onSave }>{ translate( 'Save' ) }</Button>
		</ActionHeader>
	);
};

ShippingZoneHeader.propTypes = {
	onSave: PropTypes.func.isRequired,
};

export default localize( ShippingZoneHeader );
