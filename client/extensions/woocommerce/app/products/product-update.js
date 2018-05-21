/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import accept from 'lib/accept';
import { ProtectFormGuard } from 'lib/protect-form';
import { getLink } from 'woocommerce/lib/nav-utils';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import {
	fetchProduct,
	deleteProduct as deleteProductAction,
} from 'woocommerce/state/sites/products/actions';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { fetchProductVariations } from 'woocommerce/state/sites/product-variations/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	editProduct,
	editProductAttribute,
	createProductActionList,
	clearProductEdits,
} from 'woocommerce/state/ui/products/actions';
import { getProductEdits, getProductWithLocalEdits } from 'woocommerce/state/ui/products/selectors';
import {
	editProductVariation,
	clearProductVariationEdits,
} from 'woocommerce/state/ui/products/variations/actions';
import {
	getProductVariationsWithLocalEdits,
	getVariationEditsStateForProduct,
} from 'woocommerce/state/ui/products/variations/selectors';
import {
	editProductCategory,
	clearProductCategoryEdits,
} from 'woocommerce/state/ui/product-categories/actions';
import { getProductCategoriesWithLocalEdits } from 'woocommerce/state/ui/product-categories/selectors';
import { getSaveErrorMessage } from './save-error-message';
import page from 'page';
import ProductForm from './product-form';
import ProductHeader from './product-header';
import { withAnalytics, recordTracksEvent } from 'state/analytics/actions';

class ProductUpdate extends React.Component {
	static propTypes = {
		params: PropTypes.object,
		className: PropTypes.string,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		fetchProduct: PropTypes.func.isRequired,
		fetchProductVariations: PropTypes.func.isRequired,
		fetchProductCategories: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductCategory: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	state = {
		isUploading: [],
	};

	componentDidMount() {
		const { params, product, site, variations } = this.props;
		const productId = Number( params.product_id );

		if ( site && site.ID ) {
			if ( ! product ) {
				this.props.fetchProduct( site.ID, productId );
				this.props.editProduct( site.ID, { id: productId }, {} );
			}
			if ( ! variations ) {
				this.props.fetchProductVariations( site.ID, productId );
			}
			this.props.fetchProductCategories( site.ID, { offset: 0 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { params, site } = this.props;
		const productId = Number( params.product_id );
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProduct( newSiteId, productId );
			this.props.fetchProductVariations( newSiteId, productId );
			this.props.editProduct( newSiteId, { id: productId }, {} );
			this.props.fetchProductCategories( newSiteId, { offset: 0 } );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;

		if ( site ) {
			this.props.clearProductEdits( site.ID );
			this.props.clearProductCategoryEdits( site.ID );
			this.props.clearProductVariationEdits( site.ID );
		}
	}

	onUploadStart = () => {
		this.setState( prevState => ( {
			isUploading: [ ...prevState.isUploading, [ true ] ],
		} ) );
	};

	onUploadFinish = () => {
		this.setState( prevState => ( {
			isUploading: prevState.isUploading.slice( 1 ),
		} ) );
	};

	// TODO: In v1, this deletes a product, as we don't have trash management.
	// Once we have trashing management, we can introduce 'trash' instead.
	onTrash = () => {
		const { translate, site, product, deleteProduct } = this.props;
		const areYouSure = translate( "Are you sure you want to permanently delete '%(name)s'?", {
			args: { name: product.name },
		} );
		accept( areYouSure, function( accepted ) {
			if ( ! accepted ) {
				return;
			}
			const successAction = () => {
				debounce( () => {
					page.redirect( getLink( '/store/products/:site/', site ) );
				}, 1000 )();
				return successNotice(
					translate( '%(product)s successfully deleted.', {
						args: { product: product.name },
					} )
				);
			};
			const failureAction = () => {
				return errorNotice(
					translate( 'There was a problem deleting %(product)s. Please try again.', {
						args: { product: product.name },
					} )
				);
			};
			deleteProduct( site.ID, product.id, successAction, failureAction );
		} );
	};

	onSave = () => {
		const { product, translate, site, fetchProductCategories: fetch } = this.props;
		const successAction = () => {
			fetch( site.ID, { offset: 0 } );
			return successNotice(
				translate( '%(product)s successfully updated.', {
					args: { product: product.name },
				} ),
				{
					duration: 8000,
					button: translate( 'View' ),
					onClick: () => {
						window.open( product.permalink );
					},
				}
			);
		};

		const failureAction = error => {
			const errorSlug = ( error && error.error ) || undefined;

			return errorNotice( getSaveErrorMessage( errorSlug, product.name, translate ), {
				duration: 8000,
			} );
		};

		this.props.createProductActionList( successAction, failureAction );
	};

	isProductValid( product = this.props.product ) {
		return product && product.type && product.name && product.name.length > 0;
	}

	render() {
		const {
			site,
			product,
			hasEdits,
			className,
			variations,
			productCategories,
			actionList,
		} = this.props;

		const isValid = 'undefined' !== site && this.isProductValid();
		const isBusy = Boolean( actionList ); // If there's an action list present, we're trying to save.
		const saveEnabled = isValid && ! isBusy && hasEdits && 0 === this.state.isUploading.length;

		return (
			<Main className={ className } wideLayout>
				<ProductHeader
					site={ site }
					product={ product }
					viewEnabled={ true }
					onTrash={ this.onTrash }
					onSave={ saveEnabled ? this.onSave : false }
					isBusy={ isBusy }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<ProductForm
					siteId={ site && site.ID }
					product={ product || { type: 'simple' } }
					variations={ variations }
					productCategories={ productCategories }
					editProduct={ this.props.editProduct }
					editProductCategory={ this.props.editProductCategory }
					editProductAttribute={ this.props.editProductAttribute }
					editProductVariation={ this.props.editProductVariation }
					onUploadStart={ this.onUploadStart }
					onUploadFinish={ this.onUploadFinish }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const productId = Number( ownProps.params.product_id );

	const site = getSelectedSiteWithFallback( state );
	const product = getProductWithLocalEdits( state, productId );
	const hasEdits =
		Boolean( getProductEdits( state, productId ) ) ||
		Boolean( getVariationEditsStateForProduct( state, productId ) );
	const variations = product && getProductVariationsWithLocalEdits( state, product.id );
	const productCategories = getProductCategoriesWithLocalEdits( state );
	const actionList = getActionList( state );

	return {
		site,
		product,
		hasEdits,
		variations,
		productCategories,
		actionList,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createProductActionList: ( ...args ) =>
				withAnalytics(
					recordTracksEvent( 'calypso_woocommerce_ui_product_update' ),
					createProductActionList( ...args )
				),
			deleteProduct: deleteProductAction,
			editProduct,
			editProductCategory,
			editProductAttribute,
			editProductVariation,
			fetchProduct,
			fetchProductVariations,
			fetchProductCategories,
			clearProductEdits,
			clearProductCategoryEdits,
			clearProductVariationEdits,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductUpdate ) );
