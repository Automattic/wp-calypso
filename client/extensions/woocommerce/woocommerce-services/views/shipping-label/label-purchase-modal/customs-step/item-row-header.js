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
import ExternalLink from 'calypso/components/external-link';
import InfoTooltip from 'woocommerce/woocommerce-services/components/info-tooltip';
import { getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

export const TariffCodeTitle = localize( ( { translate } ) => (
	<span>
		{ translate( 'HS Tariff number' ) } (
		<ExternalLink
			icon
			href="https://docs.woocommerce.com/document/print-shipping-labels-woocommerce-shipping/#section-1"
			target="_blank"
		>
			{ translate( 'more info' ) }
		</ExternalLink>
		)
	</span>
) );

export const OriginCountryTitle = localize( ( { translate } ) => (
	<span>
		{ translate( 'Origin country' ) }
		<InfoTooltip>
			{ translate( 'Country where the product was manufactured or assembled' ) }
		</InfoTooltip>
	</span>
) );

const ItemRowHeader = ( { translate, weightUnit } ) => (
	<div className="customs-step__item-rows-header">
		<span className="customs-step__item-description-column">{ translate( 'Description' ) }</span>
		<span className="customs-step__item-code-column">{ <TariffCodeTitle /> }</span>
		<span className="customs-step__item-weight-column">
			{ translate( 'Weight (%s per unit)', { args: [ weightUnit ] } ) }
		</span>
		<span className="customs-step__item-value-column">{ translate( 'Value ($ per unit)' ) }</span>
		<span className="customs-step__item-country-column">{ <OriginCountryTitle /> }</span>
	</div>
);

ItemRowHeader.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	weightUnit: PropTypes.string.isRequired,
};

export default connect( ( state, { orderId, siteId } ) => ( {
	weightUnit: getShippingLabel( state, orderId, siteId ).storeOptions.weight_unit,
} ) )( localize( ItemRowHeader ) );
