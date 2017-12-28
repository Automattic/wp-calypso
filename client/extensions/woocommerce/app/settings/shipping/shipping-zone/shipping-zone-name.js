/** @format */

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
import Card from 'client/components/card';
import ExtendedHeader from 'client/extensions/woocommerce/components/extended-header';
import FormTextInput from 'client/components/forms/form-text-input';
import { changeShippingZoneName } from 'client/extensions/woocommerce/state/ui/shipping/zones/actions';
import { bindActionCreatorsWithSiteId } from 'client/extensions/woocommerce/lib/redux-utils';
import { areShippingZonesFullyLoaded } from 'client/extensions/woocommerce/components/query-shipping-zones';
import {
	getCurrentlyEditingShippingZone,
	generateCurrentlyEditingZoneName,
} from 'client/extensions/woocommerce/state/ui/shipping/zones/selectors';
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoadError,
} from 'client/extensions/woocommerce/state/sites/settings/general/selectors';

const ShippingZoneName = ( {
	loaded,
	fetchError,
	zoneName,
	generatedZoneName,
	actions,
	translate,
} ) => {
	const onNameChange = event => {
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
					placeholder={ generatedZoneName }
				/>
			</div>
		);
	};

	return (
		<div>
			<ExtendedHeader
				label={ translate( 'Zone name' ) }
				description={ translate(
					'Give the zone a name of your choosing, or just use the one we created for you.' +
						' This is not visible to customers.'
				) }
			/>
			<Card className="shipping-zone__name-container">{ renderContent() }</Card>
		</div>
	);
};

ShippingZoneName.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	state => {
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
		actions: bindActionCreatorsWithSiteId(
			{
				changeShippingZoneName,
			},
			dispatch,
			ownProps.siteId
		),
	} )
)( localize( ShippingZoneName ) );
