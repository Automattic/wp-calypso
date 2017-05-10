/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import TokenField from 'components/token-field';

class ProductFormAdditionalDetailsCard extends React.Component {

	static propTypes = {
		product: PropTypes.object.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			attributeNames: [],
		};

		this.addType = this.addType.bind( this );
		this.updateNameHandler = this.updateNameHandler.bind( this );
		this.updateValues = this.updateValues.bind( this );
		this.cardToggle = this.cardToggle.bind( this );

		this.debouncedUpdateName = debounce( this.updateName, 300 );
	}

	getAttributes() {
		const { product } = this.props;
		return product.attributes && product.attributes.filter( attribute => ! attribute.variation ) || [];
	}

	addType() {
		const { product, editProductAttribute } = this.props;
		editProductAttribute( product, null, { name: '', options: [] } );
	}

	cardToggle() {
		const attributes = this.getAttributes();
		if ( ! attributes.length ) {
			this.addType();
		}
	}

	updateNameHandler( e ) {
		const attributeNames = [ ...this.state.attributeNames ];
		attributeNames[ e.target.id ] = e.target.value;
		this.setState( { attributeNames } );
		this.debouncedUpdateName( e.target.id, e.target.value );
	}

	updateName( attributeId, name ) {
		const { product, editProductAttribute } = this.props;
		const attribute = product.attributes && find( product.attributes, function( a ) {
			return a.uid === attributeId;
		} );
		editProductAttribute( product, attribute, { name } );
	}

	updateValues( values, attribute ) {
		const { product, editProductAttribute } = this.props;
		editProductAttribute( product, attribute, { options: values } );
	}

	renderInput( attribute ) {
		const { translate } = this.props;
		const { attributeNames } = this.state;
		const attributeName = attributeNames && attributeNames[ attribute.uid ] || attribute.name;
		return (
			<div key={ attribute.uid } className="products__additional-details-form-fieldset">
				<FormTextInput
					placeholder={ translate( 'Material' ) }
					value={ attributeName }
					id={ attribute.uid }
					name="type"
					onChange={ this.updateNameHandler }
				/>
				<TokenField
					placeholder={ translate( 'Comma separate these' ) }
					value={ attribute.options }
					name="values"
					/* eslint-disable react/jsx-no-bind */
					onChange={ values => this.updateValues( values, attribute ) }
				/>
			</div>
		);
	}

	renderPreview( attribute ) {
		const { attributeNames } = this.state;
		const attributeName = attributeNames && attributeNames[ attribute.uid ] || attribute.name;

		if ( ! attributeName && ! attribute.options.length ) {
			return ( <div key={ attribute.uid }></div> );
		}

		return (
			<div key={ attribute.uid } className="products__additional-details-preview-row">
				<div className="products__additional-details-preview-type">{ attributeName }</div>
				<div>{ attribute.options.join( ', ' ) }</div>
			</div>
		);
	}

	render() {
		const { translate } = this.props;
		const attributes = this.getAttributes();
		const inputs = attributes && attributes.map( this.renderInput, this );
		const previews = attributes && attributes.map( this.renderPreview, this );

		return (
			<FoldableCard
				className="products__additional-details-card"
				header={ translate( 'Add additional details' ) }
				onClick={ this.cardToggle }
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

						<Button onClick={ this.addType }>{ translate( 'Add another' ) }</Button>
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
	}
}

export default localize( ProductFormAdditionalDetailsCard );
