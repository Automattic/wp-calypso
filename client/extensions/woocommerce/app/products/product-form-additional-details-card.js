/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find, debounce } from 'lodash';
import Gridicon from 'gridicons';
import classNames from 'classnames';

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

	state = {
		attributeNames: {},
	};

	static propTypes = {
		product: PropTypes.object.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.debouncedUpdateName = debounce( this.updateName, 300 );
	}

	getAttributes() {
		const { product } = this.props;
		return product.attributes && product.attributes.filter( attribute => ! attribute.variation ) || [];
	}

	getAttribute( { attributes }, attributeId ) {
		return attributes && find( attributes, function( a ) {
			return a.uid === attributeId;
		} );
	}

	addAttribute = () => {
		const { product, editProductAttribute } = this.props;
		editProductAttribute( product, null, { name: '', options: [] } );
	}

	removeAttribute = ( e ) => {
		const { product, editProduct } = this.props;
		const attributes = [ ...this.getAttributes() ];
		const attribute = this.getAttribute( product, e.currentTarget.id );
		attributes.splice( attributes.indexOf( attribute ), 1 );
		editProduct( product, { attributes } );
	}

	cardOpen = () => {
		const attributes = this.getAttributes();
		if ( ! attributes.length ) {
			this.addAttribute();
		}
	}

	updateValues = ( values, attribute ) => {
		const { product, editProductAttribute } = this.props;
		editProductAttribute( product, attribute, { options: values } );
	}

	updateNameHandler = ( e ) => {
		const attributeNames = { ...this.state.attributeNames };
		attributeNames[ e.target.id ] = e.target.value;
		this.setState( { attributeNames } );
		this.debouncedUpdateName( e.target.id, e.target.value );
	}

	updateName( attributeId, name ) {
		const { product, editProductAttribute } = this.props;
		const attribute = this.getAttribute( product, attributeId );
		editProductAttribute( product, attribute, { name } );
	}

	renderInput( attribute, index ) {
		const { translate } = this.props;
		const { attributeNames } = this.state;
		const attributeName = attributeNames && attributeNames[ attribute.uid ] || attribute.name;
		const updateValues = ( values ) => {
			this.updateValues( values, attribute );
		};
		const removeButton = index !== 0 && (
			<Button
				borderless
				onClick={ this.removeAttribute }
				id={ attribute.uid }
			>
				<Gridicon icon="cross-small" />
			</Button>
		);

		const classes = classNames( {
			'products__additional-details-form-fieldset': true,
			'products__additional-details-form-first-row': index === 0,
		} );

		return (
			<div key={ attribute.uid } className={ classes }>
				<FormTextInput
					placeholder={ translate( 'Material' ) }
					value={ attributeName }
					id={ attribute.uid }
					name="type"
					onChange={ this.updateNameHandler }
				/>
				<TokenField
					placeholder={ translate( 'Cotton' ) }
					value={ attribute.options }
					name="values"
					onChange={ updateValues }
				/>
				<div className="products__additional-details-form-remove">
					{removeButton}
				</div>
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
				onOpen={ this.cardOpen }
				clickableHeader
			>
				<FormSettingExplanation>
					{ translate( 'Display additional details in a formatted list. ' +
					'Examples when selling apparal include Material, Type, and Cut. ' +
					'This will also allow customers to filter your store to find Women cut Hoodies in Cotton.' ) }
				</FormSettingExplanation>

				<div className="products__additional-details-container">
					<div className="products__additional-details-form-group">
						<div className="products__additional-details-form-labels">
							<FormLabel>{ translate( 'Type' ) }</FormLabel>
							<FormLabel>{ translate( 'Values' ) }</FormLabel>
						</div>

						<div className="products__additional-details-form-inputs">
							{inputs}
						</div>

						<Button compact onClick={ this.addAttribute }>{ translate( 'Add another' ) }</Button>
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
