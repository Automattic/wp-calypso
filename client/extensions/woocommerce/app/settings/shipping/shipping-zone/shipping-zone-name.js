/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { areSettingsGeneralLoaded, areSettingsGeneralLoadError } from 'woocommerce/state/sites/settings/general/selectors';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { getCurrentlyEditingShippingZone, generateCurrentlyEditingZoneName } from 'woocommerce/state/ui/shipping/zones/selectors';

const ShippingZoneName = ( { loaded, fetchError, zoneName, generatedZoneName, actions, translate } ) => {
	const onNameChange = ( event ) => {
		actions.changeShippingZoneName( event.target.value );
	};

	const renderContent = () => {
		if ( fetchError ) {
			return <div className="shipping-zone__name" />;
		}

		if ( ! loaded ) {
			return (
				<div className="shipping-zone__name is-placeholder">
					<span />
				</div>
			);
		}

		return (
			<div className="shipping-zone__name">
				<FormTextInput
					value={ zoneName }
					onChange={ onNameChange }
					placeholder={ generatedZoneName } />
			</div>
		);
	};

	return (
		<div>
			<ExtendedHeader
				label={ translate( 'Zone name' ) }
				description={ translate( 'Give the zone a name of your choosing, or just use the one we created for you.' +
					' This is not visible to customers.' ) } />
			<Card className="shipping-zone__name-container">
				{ renderContent() }
			</Card>
		</div>
	);
};

ShippingZoneName.PropTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => {
		const loaded = areShippingZonesFullyLoaded( state ) && areSettingsGeneralLoaded( state );
		const zone = loaded && getCurrentlyEditingShippingZone( state );
		return {
			loaded,
			fetchError: areSettingsGeneralLoadError( state ), // TODO: add shipping zones/methods fetch errors too
			zoneName: zone && zone.name,
			generatedZoneName: generateCurrentlyEditingZoneName( state ),
		};
	},
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			changeShippingZoneName,
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneName ) );
