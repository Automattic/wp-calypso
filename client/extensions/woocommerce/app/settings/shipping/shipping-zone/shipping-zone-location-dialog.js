/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import ShippingZoneLocationDialogCountries from './shipping-zone-location-dialog-countries';
import ShippingZoneLocationDialogSettings from './shipping-zone-location-dialog-settings';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import {
	closeEditLocations,
	cancelEditLocations,
} from 'woocommerce/state/ui/shipping/zones/locations/actions';
import {
	isEditLocationsModalOpen,
	areCurrentlyEditingShippingZoneLocationsValid,
} from 'woocommerce/state/ui/shipping/zones/locations/selectors';

const ShippingZoneLocationDialog = ( {
	siteId,
	isVisible,
	isAdding,
	translate,
	actions,
	canSave,
} ) => {
	if ( ! isVisible ) {
		return null;
	}

	const onCancel = () => actions.cancelEditLocations();
	const onClose = () => {
		if ( ! canSave ) {
			return;
		}

		actions.closeEditLocations();
	};

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{
			action: 'add',
			label: isAdding ? translate( 'Add' ) : translate( 'Done' ),
			onClick: onClose,
			disabled: ! canSave,
			isPrimary: true,
		},
	];

	return (
		<Dialog
			additionalClassNames="shipping-zone__location-dialog woocommerce"
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onCancel }
		>
			<div className="shipping-zone__location-dialog-header">{ translate( 'Edit location' ) }</div>
			<ShippingZoneLocationDialogCountries siteId={ siteId } />
			<ShippingZoneLocationDialogSettings siteId={ siteId } />
		</Dialog>
	);
};

ShippingZoneLocationDialog.propTypes = {
	siteId: PropTypes.number,
	isAdding: PropTypes.bool,
};

export default connect(
	( state ) => ( {
		isVisible: isEditLocationsModalOpen( state ),
		canSave: areCurrentlyEditingShippingZoneLocationsValid( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId(
			{
				closeEditLocations,
				cancelEditLocations,
			},
			dispatch,
			ownProps.siteId
		),
	} )
)( localize( ShippingZoneLocationDialog ) );
