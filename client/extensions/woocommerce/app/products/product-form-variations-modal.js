/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import formattedVariationName from '../../lib/formatted-variation-name';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextArea from 'components/forms/form-textarea';
import FormToggle from 'components/forms/form-toggle';
import VerticalMenu from 'components/vertical-menu';

class ProductFormVariationsModal extends React.Component {

	static propTypes = {
		product: PropTypes.object.isRequired,
		variations: PropTypes.array.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			selectedVariation: this.props.selectedVariation,
		};

		this.switchVariation = this.switchVariation.bind( this );
		this.setDescription = this.setDescription.bind( this );
		this.toggleVisible = this.toggleVisible.bind( this );
	}

	selectedVariation() {
		const { selectedVariation } = this.state;
		const { variations } = this.props;
		return find( variations, ( v ) => selectedVariation === v.id );
	}

	setDescription( e ) {
		const { product, editProductVariation } = this.props;
		const variation = this.selectedVariation();
		editProductVariation( product, variation, { description: e.target.value } );
	}

	toggleVisible() {
		const { product, editProductVariation } = this.props;
		const variation = this.selectedVariation();
		editProductVariation( product, variation, { visible: ! variation.visible } );
	}

	switchVariation( selectedVariation ) {
		this.setState( {
			selectedVariation
		} );
	}

	render() {
		const { variations, translate } = this.props;
		const { selectedVariation } = this.state;
		const variation = this.selectedVariation();

		const navItems = variations && variations.map( function( v, i ) {
			return (
				<ModalNavItem key={ i } variation={ v } selected={ selectedVariation } />
			);
		} );

		return (
			<div className="products__product-form-modal-wrapper">
				<h1>{ translate( 'Variation details' ) }</h1>

				<VerticalMenu onClick={ this.switchVariation } className="products__product-form-modal-menu">
					{navItems}
				</VerticalMenu>

				<div className="products__product-form-modal-contents">
					<h2>{ formattedVariationName( variation ) }</h2>
					<span className="products__product-form-sku">SKU:</span>

					<FormFieldSet className="products__product-form-variation-description">
						<FormLabel htmlFor="description">{ translate( 'Description' ) }</FormLabel>
						<FormTextArea name="description" value={ variation.description || '' } onChange={ this.setDescription } />
						<FormSettingExplanation>{ translate(
								'This will be displayed in addition to the main product description when this variation is selected.'
						) }</FormSettingExplanation>
					</FormFieldSet>

					<FormLabel>
						{ translate( 'Visible' ) }
						<FormToggle
							onChange={ this.toggleVisible }
							checked={ variation.visible }
						/>
					</FormLabel>
					<FormSettingExplanation>{ translate(
						'Hidden variations cannot be selected for purchase by customers.'
					) }</FormSettingExplanation>
				</div>
			</div>
		);
	}

}

const ModalNavItem = props => {
	const {
		onClick,
		variation,
		selected,
	} = props;

	const classes = classNames(
		'vertical-menu__items',
		{ 'is-selected': ( variation.id === selected ) }
	);

	const clickHandler = () => {
		onClick( variation.id );
	};

	return (
		<li className={ classes } onClick={ clickHandler }>
			{ formattedVariationName( variation ) }
		</li>
	);
};

export default localize( ProductFormVariationsModal );
