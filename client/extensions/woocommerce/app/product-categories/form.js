/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { debounce, isNumber, head, isNull } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import FormFieldSet from 'components/forms/form-fieldset';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import ImagePreloader from 'components/image-preloader';
import ProductImageUploader from 'woocommerce/components/product-image-uploader';
import Spinner from 'components/spinner';
import TermTreeSelectorTerms from 'blocks/term-tree-selector/terms';

class ProductCategoryForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		category: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editProductCategory: PropTypes.func.isRequired,
		onUploadStart: PropTypes.func,
		onUploadFinish: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		const { category } = props;
		const image = ( category && category.image ) || {};
		const isTopLevel = category && category.parent ? false : true;
		const selectedParent = ( ! isTopLevel && [ category.parent ] ) || [];

		this.state = {
			id: image.id || null,
			src: image.src || null,
			placeholder: null,
			transientId: null,
			isUploading: false,
			search: '',
			selectedParent,
			isTopLevel,
		};

		this.debouncedSetDescription = debounce( this.setDescription, 200 );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.category.image !== this.props.category.image ) {
			const image = ( nextProps.category && nextProps.category.image ) || {};
			this.setState( {
				id: image.id || null,
				src: image.src || null,
			} );
		}

		if ( nextProps.category.parent !== this.props.category.parent ) {
			if ( isNull( nextProps.category.parent ) ) {
				this.setState( {
					selectedParent: [],
					isTopLevel: false,
				} );
				return;
			}
			const isTopLevel = nextProps.category && nextProps.category.parent ? false : true;
			const selectedParent = ( ! isTopLevel && [ nextProps.category.parent ] ) || [];
			this.setState( {
				selectedParent,
				isTopLevel,
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

	setParent = parent => {
		const { siteId, category, editProductCategory } = this.props;
		editProductCategory( siteId, category, { parent: parent.ID } );
	};

	onTopLevelChange = () => {
		const { siteId, category, editProductCategory } = this.props;

		if ( this.state.isTopLevel ) {
			editProductCategory( siteId, category, { parent: null } );
		} else {
			editProductCategory( siteId, category, { parent: 0 } );
		}

		if ( ! category.parent ) {
			this.setState( {
				isTopLevel: ! this.state.isTopLevel,
			} );
		}
	};

	onSearch = searchTerm => {
		if ( searchTerm !== this.state.search ) {
			this.setState( {
				search: searchTerm,
			} );
		}
	};

	onSelect = files => {
		const file = head( files );
		this.setState( {
			placeholder: file.preview,
			transientId: file.ID,
			isUploading: true,
		} );
		this.props.onUploadStart();
	};

	onUpload = file => {
		const { siteId, editProductCategory, category } = this.props;
		const image = {
			src: file.URL,
			id: file.ID,
		};
		this.setState( {
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
					onFinish={ this.props.onUploadFinish }
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
		const { search, selectedParent, isTopLevel } = this.state;

		const isCategoryLoaded = category && isNumber( category.id ) ? Boolean( category.slug ) : true;

		if ( ! siteId || ! category || ! isCategoryLoaded ) {
			return this.renderPlaceholder();
		}

		const query = {};
		if ( search && search.length ) {
			query.search = search;
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
							<FormFieldSet>
								<FormLabel>
									<FormCheckbox
										checked={ this.state.isTopLevel }
										onChange={ this.onTopLevelChange }
									/>
									<span>
										{ translate( 'Top level category', {
											context:
												'Categories: New category being created is top level i.e. has no parent',
										} ) }{' '}
									</span>
								</FormLabel>

								{ ( ! isTopLevel || isNull( category.parent ) ) && (
									<div>
										<FormLabel>{ translate( 'Select a parent category' ) }</FormLabel>
										<TermTreeSelectorTerms
											siteId={ siteId }
											taxonomy="product_cat"
											selected={ selectedParent }
											onChange={ this.setParent }
											multiple={ false }
											height={ 300 }
											width={ 400 }
											hideTermAndChildren={ ( isNumber( category.id ) && category.id ) || null }
											query={ query }
											onSearch={ this.onSearch }
											emptyMessage={ translate( 'No categories found.' ) }
											searchThreshold={ 0 }
										/>
									</div>
								) }
							</FormFieldSet>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( ProductCategoryForm );
