/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { debounce, isNumber, head } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import ImagePreloader from 'components/image-preloader';
import ProductImageUploader from 'woocommerce/components/product-image-uploader';
import Spinner from 'components/spinner';

class ProductCategoryForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		category: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editProductCategory: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		const { category } = props;
		const image = ( category && category.image ) || {};

		this.state = {
			id: image.id || null,
			src: image.src || null,
			placeholder: null,
			transientId: null,
			isUploading: false,
		};

		this.debouncedSetDescription = debounce( this.setDescription, 200 );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.category !== this.props.category ) {
			const image = ( nextProps.category && nextProps.category.image ) || {};
			this.setState( {
				id: image.id || null,
				src: image.src || null,
			} );
		}
	}

	setName = e => {
		const { siteId, category, editProductCategory } = this.props;
		const name = e.target.value;
		editProductCategory( siteId, category, { name } );
	};

	setDescription = description => {
		const { siteId, category, editProductCategory } = this.props;
		editProductCategory( siteId, category, { description } );
	};

	onSelect = files => {
		const file = head( files );
		this.setState( {
			placeholder: file.preview,
			transientId: file.ID,
			isUploading: true,
		} );
	};

	onUpload = file => {
		const { siteId, editProductCategory, category } = this.props;
		const image = {
			src: file.URL,
			id: file.ID,
		};
		this.setState( {
			...image,
			transientId: null,
			isUploading: false,
		} );
		editProductCategory( siteId, category, { image } );
	};

	onError = () => {
		this.setState( {
			placeholder: null,
			transientId: null,
			isUploading: false,
		} );
	};

	removeImage = () => {
		const { siteId, editProductCategory, category } = this.props;
		this.setState( {
			placeholder: null,
			transientId: null,
			isUploading: false,
			src: null,
			id: null,
		} );
		editProductCategory( siteId, category, { image: {} } );
	};

	renderImage = () => {
		const { src, placeholder, isUploading } = this.state;

		let image = null;
		if ( src && ! isUploading ) {
			image = (
				<figure>
					<ImagePreloader
						src={ src }
						placeholder={ ( placeholder && <img src={ placeholder } /> ) || <span /> }
					/>
				</figure>
			);
		} else if ( isUploading ) {
			image = (
				<figure>
					<img src={ placeholder || null } />
					<Spinner />
				</figure>
			);
		}

		const classes = classNames( 'product-categories__form-image', {
			preview: null === src,
			uploader: ! image,
		} );

		const removeButton = image && (
			<Button
				compact
				onClick={ this.removeImage }
				className="product-categories__form-image-remove"
			>
				<Gridicon icon="cross" size={ 24 } className="product-categories__form-image-remove-icon" />
			</Button>
		);

		return (
			<div className={ classes }>
				<ProductImageUploader
					multiple={ false }
					onSelect={ this.onSelect }
					onUpload={ this.onUpload }
					onError={ this.onError }
				>
					{ image }
				</ProductImageUploader>
				{ removeButton }
			</div>
		);
	};

	renderPlaceholder() {
		const { className } = this.props;
		return (
			<div className={ classNames( 'product-categories__form', 'is-placeholder', className ) }>
				<div />
			</div>
		);
	}

	renderTinyMCE() {
		const { category } = this.props;

		if (
			( isNumber( category.id ) && 'undefined' === typeof category.description ) ||
			'undefined' === typeof category.id
		) {
			return <div className="product-categories__form-tinymce-placeholder" />;
		}

		return (
			<CompactTinyMCE
				initialValue={ category.description || '' }
				onContentsChange={ this.debouncedSetDescription }
			/>
		);
	}

	render() {
		const { siteId, category, translate } = this.props;

		const isCategoryLoaded = category && isNumber( category.id ) ? Boolean( category.slug ) : true;

		if ( ! siteId || ! category || ! isCategoryLoaded ) {
			return this.renderPlaceholder();
		}
		return (
			<div className={ classNames( 'product-categories__form', this.props.className ) }>
				<Card>
					<div className="product-categories__form-info-fields">
						<div className="product-categories__form-image-wrapper">{ this.renderImage() }</div>
						<div className="product-categories__form-name-description">
							<FormFieldSet>
								<FormLabel htmlFor="name">{ translate( 'Category name' ) }</FormLabel>
								<FormTextInput id="name" value={ category.name || '' } onChange={ this.setName } />
							</FormFieldSet>
							<FormFieldSet>
								<FormLabel htmlFor="description">{ translate( 'Description' ) }</FormLabel>
								{ this.renderTinyMCE() }
							</FormFieldSet>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( ProductCategoryForm );
