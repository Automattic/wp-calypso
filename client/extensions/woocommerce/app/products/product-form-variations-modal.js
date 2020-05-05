/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import FormClickToEditInput from 'woocommerce/components/form-click-to-edit-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle';
import getKeyboardHandler from 'woocommerce/lib/get-keyboard-handler';

class ProductFormVariationsModal extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.object.isRequired,
		variations: PropTypes.array.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		const { selectedVariation } = props;

		this.state = {
			selectedVariation,
			editor: () => this.editorComponent( selectedVariation ),
		};

		this.switchVariation = this.switchVariation.bind( this );
		this.toggleVisible = this.toggleVisible.bind( this );
	}

	/*
	 * Initialize an editor when loading a different variation so we can
	 * make sure the correct event handler runs, and that we don't share the
	 * same TinyMCE instance for different descriptions.
	 */
	editorComponent = ( variationId ) => {
		const { siteId, product, variations, editProductVariation } = this.props;
		const variation = find( variations, ( v ) => variationId === v.id );
		const setDescription = debounce( ( description ) => {
			editProductVariation( siteId, product, variation, { description } );
		}, 200 );
		return (
			<CompactTinyMCE
				initialValue={ variation.description || '' }
				onContentsChange={ setDescription }
			/>
		);
	};

	selectedVariation() {
		const { selectedVariation } = this.state;
		const { variations } = this.props;
		return find( variations, ( v ) => selectedVariation === v.id );
	}

	setSku = ( sku ) => {
		const { siteId, product, editProductVariation } = this.props;
		const variation = this.selectedVariation();
		editProductVariation( siteId, product, variation, { sku } );
	};

	toggleVisible() {
		const { siteId, product, editProductVariation } = this.props;
		const variation = this.selectedVariation();
		const status = 'publish' === variation.status ? 'private' : 'publish';
		editProductVariation( siteId, product, variation, { status } );
	}

	switchVariation( selectedVariation ) {
		this.setState( {
			selectedVariation,
			editor: () => this.editorComponent( selectedVariation ),
		} );
	}

	render() {
		const { variations, translate } = this.props;
		const { selectedVariation } = this.state;
		const variation = this.selectedVariation();

		const navItems =
			variations &&
			variations.map( ( v, i ) => {
				return (
					<ModalNavItem
						key={ i }
						variation={ v }
						onClick={ this.switchVariation }
						selected={ selectedVariation }
					/>
				);
			} );

		const Editor = this.state.editor;

		return (
			<div className="products__product-form-modal-wrapper">
				<h1>{ translate( 'Variation details' ) }</h1>

				<div className="products__product-form-modal-menu vertical-menu">{ navItems }</div>

				<div className="products__product-form-modal-contents">
					<h2>{ formattedVariationName( variation ) }</h2>
					<FormFieldSet className="products__product-form-details-basic-sku">
						<FormLabel htmlFor="sku">{ translate( 'SKU:' ) }</FormLabel>
						<FormClickToEditInput
							id="sku"
							value={ variation.sku || '' }
							placeholder="-"
							onChange={ this.setSku }
							updateAriaLabel={ translate( 'Update SKU' ) }
							editAriaLabel={ translate( 'Edit SKU' ) }
						/>
					</FormFieldSet>

					<FormFieldSet className="products__product-form-variation-description">
						<FormLabel htmlFor="description">{ translate( 'Description' ) }</FormLabel>
						<Editor />
						<FormSettingExplanation>
							{ translate(
								'This additional information will be displayed when a customer choses this variation.'
							) }
						</FormSettingExplanation>
					</FormFieldSet>

					<FormLabel>
						{ translate( 'Visible' ) }
						<FormToggle
							onChange={ this.toggleVisible }
							checked={ 'publish' === variation.status }
						/>
					</FormLabel>
					<FormSettingExplanation>
						{ translate( 'Hide variations you don’t want to offer to customers.' ) }
					</FormSettingExplanation>
				</div>
			</div>
		);
	}
}

const ModalNavItem = ( { onClick, variation, selected } ) => {
	const classes = classNames( 'vertical-menu__items', {
		'is-selected': variation.id === selected,
	} );

	const clickHandler = () => {
		onClick( variation.id );
	};

	return (
		<div
			className={ classes }
			role="button"
			tabIndex="0"
			onClick={ clickHandler }
			onKeyDown={ getKeyboardHandler( clickHandler ) }
		>
			{ formattedVariationName( variation ) }
		</div>
	);
};

export default localize( ProductFormVariationsModal );
