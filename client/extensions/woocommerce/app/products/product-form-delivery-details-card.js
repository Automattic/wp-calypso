/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormDimensionsInput from '../../components/form-dimensions-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';

const ProductFormDeliveryDetailsCard = ( { product, editProduct, translate } ) => {
	const setDimension = ( e ) => {
		const dimensions = { ...product.dimensions, [ e.target.name ]: e.target.value };
		editProduct( product, { dimensions } );
	};

	const { dimensions } = product;

	// TODO Pull in dimensions unit from settings API.
	return (
		<Card className="products__product-form-delivery-details">
			<FormFieldSet>
				<FormLabel>{ translate( 'Dimensions' ) }</FormLabel>
				<FormDimensionsInput
					unit="in"
					dimensions={ dimensions }
					onChange={ setDimension }
				/>
			</FormFieldSet>
		</Card>
	);
};

ProductFormDeliveryDetailsCard.propTypes = {
	product: PropTypes.object.isRequired,
	editProduct: PropTypes.func.isRequired,
};

export default localize( ProductFormDeliveryDetailsCard );
