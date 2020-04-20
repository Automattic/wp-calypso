/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, forEach, kebabCase, keys, sortBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';

// Use a constant for the default attribute state.
const DEFAULT_ATTR = 'any';

class ProductVariations extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		product: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	};

	constructor( props ) {
		super( props );
		this.state = {};
		const attributes = filter( props.product.attributes, { variation: true } );
		forEach( attributes, ( attr ) => {
			this.state[ attr.name ] = DEFAULT_ATTR;
		} );
	}

	onChange = ( name ) => ( event ) => {
		this.setState( { [ name ]: event.target.value }, () => {
			this.props.onChange( this.state, this.resetAttrs );
		} );
	};

	resetAttrs = () => {
		this.setState( ( prevState ) => {
			const newState = {};
			keys( prevState ).map( ( name ) => {
				newState[ name ] = DEFAULT_ATTR;
			} );
			return newState;
		} );
	};

	renderAttribute = ( attribute ) => {
		const { translate } = this.props;
		const fieldId = kebabCase( attribute.name );
		return (
			<div className="product-search__variation-field" key={ fieldId }>
				<FormLabel htmlFor={ `select-${ fieldId }` }>{ attribute.name }</FormLabel>
				<FormSelect
					id={ `select-${ fieldId }` }
					onChange={ this.onChange( attribute.name ) }
					value={ this.state[ attribute.name ] }
				>
					<option key={ `${ attribute.name }-${ DEFAULT_ATTR }` } value={ DEFAULT_ATTR }>
						{ translate( 'Select one' ) }
					</option>
					{ attribute.options.map( ( opt, i ) => (
						<option key={ `${ attribute.name }-${ i }` } value={ opt }>
							{ opt }
						</option>
					) ) }
				</FormSelect>
			</div>
		);
	};

	render() {
		const { product, translate } = this.props;

		if ( ! product || 'variable' !== product.type ) {
			return null;
		}

		const attributes = sortBy( filter( product.attributes, { variation: true } ), 'position' );

		return (
			<div className="product-search__variations">
				<FormFieldset>
					<FormLegend>
						{ translate( '%(product)s has variations. Choose a specific variation to add.', {
							args: { product: product.name },
						} ) }
					</FormLegend>
					<div className="product-search__variation-fields">
						{ attributes.map( this.renderAttribute ) }
					</div>
				</FormFieldset>
			</div>
		);
	}
}

export default localize( ProductVariations );
