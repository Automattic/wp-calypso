/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import TokenField from 'components/token-field';

const ProductFormAdditionalDetailsCard = ( { product, translate, editProductAttribute } ) => {
	const getAttributes = () => {
		return product.attributes && product.attributes.filter( attribute => ! attribute.variation ) || [];
	};

	const addType = () => {
		editProductAttribute( product, null, { name: '', options: [] } );
	};

	const cardToggle = () => {
		const attributes = getAttributes();
		if ( ! attributes.length ) {
			addType();
		}
	};

	const updateName = ( e ) => {
		const attribute = product.attributes && find( product.attributes, function( a ) {
			return a.uid === e.target.id;
		} );
		editProductAttribute( product, attribute, { name: e.target.value } );
	};

	const updateValues = ( values, attribute ) => {
		editProductAttribute( product, attribute, { options: values } );
	};

	const renderInput = ( attribute ) => {
		return (
			<div key={ attribute.uid } className="products__additional-details-form-fieldset">
				<FormTextInput
					placeholder={ translate( 'Material' ) }
					value={ attribute.name }
					id={ attribute.uid }
					name="type"
					onChange={ updateName }
				/>
				<TokenField
					placeholder={ translate( 'Comma separate these' ) }
					value={ attribute.options }
					name="values"
					/* eslint-disable react/jsx-no-bind */
					onChange={ values => updateValues( values, attribute ) }
				/>
			</div>
		);
	};

	const renderPreview = ( attribute ) => {
		if ( ! attribute.name && ! attribute.options.length ) {
			return ( <div key={ attribute.uid }></div> );
		}

		return (
			<div key={ attribute.uid } className="products__additional-details-preview-row">
				<div className="products__additional-details-preview-type">{ attribute.name }</div>
				<div>{ attribute.options.join( ', ' ) }</div>
			</div>
		);
	};

	const attributes = getAttributes();
	const inputs = attributes && attributes.map( renderInput );
	const previews = attributes && attributes.map( renderPreview );

	return (
		<FoldableCard
			className="products__additional-details-card"
			header={ translate( 'Add additional details' ) }
			onClick={ cardToggle }
		>
			<FormSettingExplanation>
				{ translate( 'Display additional details in a formatted list. This will also allow customers ' +
				'to filter your store to find the products they want based on the info you put here.' ) }
			</FormSettingExplanation>

			<div className="products__additional-details-container">
				<div className="products__additional-details-form-group">
					<div className="products__additional-details-form-labels">
						<FormLabel>{ translate( 'Type' ) }</FormLabel>
						<FormLabel>{ translate( 'Value' ) }</FormLabel>
					</div>

					<div className="products__additional-details-form-inputs">
						{inputs}
					</div>

					<Button onClick={ addType }>{ translate( 'Add another' ) }</Button>
				</div>

				<div className="products__additional-details-preview-container">
					<span className="products__additional-details-preview-label">
						{ translate( 'Preview' ) }
					</span>

					<div className="products__additional-details-preview">
						<div className="products__additional-details-preview-title">
							{ translate( 'Product details' ) }
						</div>
						{previews}
					</div>
				</div>
			</div>
		</FoldableCard>
	);
};

ProductFormAdditionalDetailsCard.propTypes = {
	product: PropTypes.object.isRequired,
	editProductAttribute: PropTypes.func.isRequired,
};

export default localize( ProductFormAdditionalDetailsCard );
