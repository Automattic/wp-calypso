/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const ShippingZoneHeader = ( { zone, site, onSave, translate } ) => {
	const currentCrumb = zone && isNumber( zone.id )
		? ( <span>{ translate( 'Edit Shipping Zone' ) }</span> )
		: ( <span>{ translate( 'Add New Shipping Zone' ) }</span> );

	const breadcrumbs = [
		( <a href={ getLink( '/store/settings/:site/', site ) }> { translate( 'Settings' ) } </a> ),
		( <a href={ getLink( '/store/settings/shipping/:site/', site ) }> { translate( 'Shipping' ) } </a> ),
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs }>
			<Button borderless><Gridicon icon="trash" /></Button>
			<Button primary onClick={ onSave }>{ translate( 'Save' ) }</Button>
		</ActionHeader>
	);
};

ShippingZoneHeader.propTypes = {
	onSave: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
		zone: getCurrentlyEditingShippingZone( state ),
	} ),
)( localize( ShippingZoneHeader ) );
