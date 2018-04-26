/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, sumBy } from 'lodash';

/**
 * Internal dependencies
 */
import TextField from 'woocommerce/woocommerce-services/components/text-field';
import FormLegend from 'components/forms/form-legend';
import {
	setCustomsItemDescription,
	setCustomsItemTariffNumber,
	setCustomsItemOriginCountry,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import getProductLink from 'woocommerce/woocommerce-services/lib/utils/get-product-link';
import { getSite } from 'state/sites/selectors';
import CountryDropdown from 'woocommerce/woocommerce-services/components/country-dropdown';
import formatCurrency from 'lib/format-currency';

const ItemRow = ( props ) => {
	const {
		site,
		errors,
		packageId,
		productId,
		parentProductId,
		translate,
		description,
		defaultDescription,
		tariffNumber,
		originCountry,
		quantity,
		value,
		countriesData,
	} = props;

	return <div className="customs-step__item-row">
		<span className="customs-step__item-id-column">
			{ parentProductId
				? <a
					href={ getProductLink( parentProductId, site ) }
					target="_blank"
					rel="noopener noreferrer">
					#{ productId }
				</a>
				: <span>#{ productId }</span> }
		</span>

		<div className="customs-step__item-value-column">
			<FormLegend>{ translate( 'Value' ) }</FormLegend>
			<span>{ quantity + ' * ' + formatCurrency( value, 'USD' ) }</span>
		</div>
		<TextField
			id={ packageId + '_' + productId + '_description' }
			className="customs-step__item-description-column"
			title={ translate( 'Description' ) }
			value={ description || '' }
			placeholder={ defaultDescription }
			updateValue={ props.setCustomsItemDescription }
			error={ errors.description } />
		<CountryDropdown
			id={ packageId + '_' + productId + '_originCountry' }
			className="customs-step__item-country-column"
			title={ translate( 'Origin country' ) }
			value={ originCountry }
			updateValue={ props.setCustomsItemOriginCountry }
			countriesData={ countriesData } />
		<TextField
			id={ packageId + '_' + productId + '_tariffNumber' }
			className="customs-step__item-code-column"
			title={ translate( 'HS Tariff Code' ) }
			value={ tariffNumber || '' }
			updateValue={ props.setCustomsItemTariffNumber }
			error={ errors.tariffNumber } />
	</div>;
};

ItemRow.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	packageId: PropTypes.string.isRequired,
	productId: PropTypes.number.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId, packageId, productId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};

	return {
		...shippingLabel.form.customs.items[ productId ],
		quantity: sumBy( filter( shippingLabel.form.packages.selected[ packageId ].items, { product_id: productId } ), 'quantity' ),
		site: getSite( state, siteId ),
		errors: loaded ? getFormErrors( state, orderId, siteId ).customs.items[ productId ] : {},
		countriesData: storeOptions.countriesData || {},
	};
};

const mapDispatchToProps = ( dispatch, { orderId, siteId, productId } ) => ( {
	setCustomsItemDescription: ( value ) => dispatch( setCustomsItemDescription( orderId, siteId, productId, value ) ),
	setCustomsItemTariffNumber: ( value ) => dispatch( setCustomsItemTariffNumber( orderId, siteId, productId, value ) ),
	setCustomsItemOriginCountry: ( value ) => dispatch( setCustomsItemOriginCountry( orderId, siteId, productId, value ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ItemRow ) );

export const Header = localize( ( { translate } ) => (
	<div className="customs-step__item-rows-header">
		<span className="customs-step__item-id-column">&nbsp;</span>
		<span className="customs-step__item-value-column">{ translate( 'Value' ) }</span>
		<span className="customs-step__item-description-column">{ translate( 'Description' ) }</span>
		<span className="customs-step__item-country-column">{ translate( 'Origin country' ) }</span>
		<span className="customs-step__item-code-column">{ translate( 'HS Tariff Code' ) }</span>
	</div>
) );
