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
import TextField from 'woocommerce/woocommerce-services/components/text-field';
import {
	setCustomsItemDescription,
	setCustomsItemTariffNumber,
	setCustomsItemOriginCountry,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	getAllCountryNames,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';

const TariffCodeTitle = localize( ( { translate } ) =>
	<span>{ translate( 'Tariff Code' ) } (<a href="https://hts.usitc.gov/"
		target="_blank" rel="noopener noreferrer">{ translate( 'look up' ) }</a>)</span>
);

const ItemRow = ( props ) => {
	const {
		errors,
		packageId,
		productId,
		translate,
		description,
		defaultDescription,
		tariffNumber,
		originCountry,
		countryNames,
	} = props;

	return <div className="customs-step__item-row">
		<TextField
			id={ packageId + '_' + productId + '_description' }
			className="customs-step__item-description-column"
			title={ translate( 'Description' ) }
			value={ description }
			placeholder={ defaultDescription }
			updateValue={ props.setCustomsItemDescription }
			error={ errors.description } />
		<Dropdown
			id={ packageId + '_' + productId + '_originCountry' }
			className="customs-step__item-country-column"
			title={ translate( 'Origin country' ) }
			value={ originCountry }
			updateValue={ props.setCustomsItemOriginCountry }
			valuesMap={ countryNames } />
		<TextField
			id={ packageId + '_' + productId + '_tariffNumber' }
			className="customs-step__item-code-column"
			title={ <TariffCodeTitle /> }
			value={ tariffNumber }
			updateValue={ props.setCustomsItemTariffNumber }
			error={ errors.tariffNumber } />
	</div>;
};

ItemRow.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	packageId: PropTypes.string.isRequired,
	productId: PropTypes.number.isRequired,
	description: PropTypes.string.isRequired,
	defaultDescription: PropTypes.string.isRequired,
	tariffNumber: PropTypes.string.isRequired,
	originCountry: PropTypes.string.isRequired,
	errors: PropTypes.object,
	countryNames: PropTypes.object.isRequired,
	setCustomsItemDescription: PropTypes.func.isRequired,
	setCustomsItemTariffNumber: PropTypes.func.isRequired,
	setCustomsItemOriginCountry: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId, productId } ) => {
	const isShippingLabelLoaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const { description, defaultDescription, tariffNumber, originCountry } = shippingLabel.form.customs.items[ productId ];

	return {
		description,
		defaultDescription,
		tariffNumber,
		originCountry,
		errors: isShippingLabelLoaded ? getFormErrors( state, orderId, siteId ).customs.items[ productId ] : {},
		countryNames: getAllCountryNames( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch, { orderId, siteId, productId } ) => ( {
	setCustomsItemDescription: ( value ) => dispatch( setCustomsItemDescription( orderId, siteId, productId, value ) ),
	setCustomsItemTariffNumber: ( value ) => dispatch( setCustomsItemTariffNumber( orderId, siteId, productId, value ) ),
	setCustomsItemOriginCountry: ( value ) => dispatch( setCustomsItemOriginCountry( orderId, siteId, productId, value ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ItemRow ) );

export const ItemRowHeader = localize( ( { translate } ) => (
	<div className="customs-step__item-rows-header">
		<span className="customs-step__item-description-column">{ translate( 'Description' ) }</span>
		<span className="customs-step__item-country-column">{ translate( 'Origin country' ) }</span>
		<span className="customs-step__item-code-column">{ <TariffCodeTitle /> }</span>
	</div>
) );
