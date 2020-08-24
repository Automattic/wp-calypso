/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { debounce, find } from 'lodash';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FoldableCard from 'components/foldable-card';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import TokenField from 'components/token-field';

class ProductFormAdditionalDetailsCard extends Component {
	state = {
		attributeNames: {},
	};

	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.shape( {
			attributes: PropTypes.array,
		} ),
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.debouncedUpdateName = debounce( this.updateName, 300 );
	}

	getAttributes() {
		const { product } = this.props;
		return (
			( product.attributes &&
				product.attributes.filter( ( attribute ) => ! attribute.variation ) ) ||
			[]
		);
	}

	getAttribute( { attributes }, attributeId ) {
		return (
			attributes &&
			find( attributes, function ( a ) {
				return a.uid === attributeId;
			} )
		);
	}

	addAttribute = () => {
		const { siteId, product, editProductAttribute } = this.props;
		editProductAttribute( siteId, product, null, { name: '', options: [], visible: true } );
	};

	cardOpen = () => {
		const attributes = this.getAttributes();
		if ( ! attributes.length ) {
			this.addAttribute();
		}
	};

	cardClose = () => {
		const attributes = this.getAttributes();
		if (
			attributes.length === 1 &&
			attributes[ 0 ] &&
			! attributes[ 0 ].name &&
			! attributes[ 0 ].options.length
		) {
			this.removeAttribute( attributes[ 0 ].uid );
		}
	};

	removeAttributeHandler = ( e ) => {
		this.removeAttribute( e.currentTarget.id );
	};

	removeAttribute( uid ) {
		const { siteId, product, editProduct } = this.props;
		const attributes = [ ...product.attributes ];
		const attribute = this.getAttribute( product, uid );
		attributes.splice( attributes.indexOf( attribute ), 1 );
		editProduct( siteId, product, { attributes } );
	}

	updateValues = ( values, attribute ) => {
		const { siteId, product, editProductAttribute } = this.props;
		editProductAttribute( siteId, product, attribute, { options: values, visible: true } );
	};

	updateNameHandler = ( e ) => {
		const attributeNames = { ...this.state.attributeNames };
		attributeNames[ e.target.id ] = e.target.value;
		this.setState( { attributeNames } );
		this.debouncedUpdateName( e.target.id, e.target.value );
	};

	updateName( attributeId, name ) {
		const { siteId, product, editProductAttribute } = this.props;
		const attribute = this.getAttribute( product, attributeId );
		editProductAttribute( siteId, product, attribute, { name } );
	}

	renderInput( attribute ) {
		const { translate } = this.props;
		const { attributeNames } = this.state;
		const attributeName = ( attributeNames && attributeNames[ attribute.uid ] ) || attribute.name;
		const attributes = this.getAttributes();
		const updateValues = ( values ) => {
			this.updateValues( values, attribute );
		};
		const removeButton = attributes.length > 1 && (
			<div className="products__additional-details-form-remove">
				<Button borderless onClick={ this.removeAttributeHandler } id={ attribute.uid }>
					<Gridicon icon="cross-small" />
				</Button>
			</div>
		);

		const classes = classNames( {
			'products__additional-details-form-fieldset': true,
			'products__additional-details-form-single-row': attributes.length === 1,
		} );

		return (
			<div key={ attribute.uid } className={ classes }>
				<FormTextInput
					placeholder={ translate( 'Fabric' ) }
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
				{ removeButton }
			</div>
		);
	}

	renderPreview( attribute ) {
		const { attributeNames } = this.state;
		const attributeName = ( attributeNames && attributeNames[ attribute.uid ] ) || attribute.name;

		if ( ! attributeName && ! attribute.options.length ) {
			return <div key={ attribute.uid } />;
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
				onClose={ this.cardClose }
				clickableHeader
			>
				<p>
					{ translate(
						'Include additional details about your products, like ‘fabric’ or ‘type’ ' +
							'for apparel. These details will be displayed alongside your product.'
					) }
				</p>

				<div className="products__additional-details-container">
					<div className="products__additional-details-form-group">
						<div className="products__additional-details-form-labels">
							<FormLabel>{ translate( 'Type' ) }</FormLabel>
							<FormLabel>{ translate( 'Values' ) }</FormLabel>
						</div>

						<div className="products__additional-details-form-inputs">{ inputs }</div>

						<Button compact onClick={ this.addAttribute }>
							{ translate( 'Add another' ) }
						</Button>
					</div>

					<div className="products__additional-details-preview-container">
						<span className="products__additional-details-preview-label">
							{ translate( 'Preview' ) }
						</span>

						<div className="products__additional-details-preview">
							<div className="products__additional-details-preview-title">
								{ translate( 'Product details' ) }
							</div>
							{ previews }
						</div>
					</div>
				</div>
			</FoldableCard>
		);
	}
}

export default localize( ProductFormAdditionalDetailsCard );
