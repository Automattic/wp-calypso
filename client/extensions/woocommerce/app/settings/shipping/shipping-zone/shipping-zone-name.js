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
import { Card } from '@automattic/components';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormTextInput from 'components/forms/form-text-input';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import {
	getCurrentlyEditingShippingZone,
	generateCurrentlyEditingZoneName,
} from 'woocommerce/state/ui/shipping/zones/selectors';
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoadError,
} from 'woocommerce/state/sites/settings/general/selectors';

const ShippingZoneName = ( {
	loaded,
	fetchError,
	zoneName,
	generatedZoneName,
	actions,
	translate,
} ) => {
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
	( state, ownProps ) => {
		const loaded =
			areShippingZonesFullyLoaded( state, ownProps.siteId ) &&
			areSettingsGeneralLoaded( state, ownProps.siteId );
		const zone = loaded && getCurrentlyEditingShippingZone( state, ownProps.siteId );
		return {
			loaded,
			fetchError: areSettingsGeneralLoadError( state, ownProps.siteId ), // TODO: add shipping zones/methods fetch errors too
			zoneName: zone && zone.name,
			generatedZoneName: generateCurrentlyEditingZoneName( state, ownProps.siteId ),
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
