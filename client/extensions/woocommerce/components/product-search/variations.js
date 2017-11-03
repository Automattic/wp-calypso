/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, forEach, kebabCase, sortBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';

class ProductVariations extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		product: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	};

	constructor( props ) {
		super( props );
		this.state = {};
		const attributes = filter( props.product.attributes, { variation: true } );
		forEach( attributes, attr => {
			this.state[ attr.name ] = '';
		} );
	}

	onChange = name => event => {
		this.state[ name ] = event.target.value;
		this.props.onChange( this.state );
	};

	renderAttribute = attribute => {
		const { translate } = this.props;
		return (
			<div className="product-search__variation-field" key={ attribute.id }>
				<FormLabel htmlFor={ `select-${ kebabCase( attribute.name ) }` }>
					{ attribute.name }
				</FormLabel>
				<FormSelect
					id={ `select-${ kebabCase( attribute.name ) }` }
					onChange={ this.onChange( attribute.name ) }
				>
					<option key={ 'any' } value="any">
						{ translate( 'Any' ) }
					</option>
					{ attribute.options.map( ( opt, i ) => <option key={ i }>{ opt }</option> ) }
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
						{ translate(
							'%(product)s has variations. Select a specific customization, or add the base product.',
							{ args: { product: product.name } }
						) }
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
