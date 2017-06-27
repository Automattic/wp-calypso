/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { createProduct, fetchProduct } from 'woocommerce/state/sites/products/actions';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { fetchProductVariations } from 'woocommerce/state/sites/product-variations/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	editProduct,
	editProductAttribute,
	createProductActionList
} from 'woocommerce/state/ui/products/actions';
import { getCurrentlyEditingProduct } from 'woocommerce/state/ui/products/selectors';
import { editProductVariation } from 'woocommerce/state/ui/products/variations/actions';
import { getProductVariationsWithLocalEdits } from 'woocommerce/state/ui/products/variations/selectors';
import { editProductCategory } from 'woocommerce/state/ui/product-categories/actions';
import { getProductCategoriesWithLocalEdits } from 'woocommerce/state/ui/product-categories/selectors';
import ProductForm from './product-form';
import ProductHeader from './product-header';

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

	componentDidMount() {
		const { params, product, site } = this.props;
		const productId = Number( params.product );

		if ( site && site.ID ) {
			if ( ! product ) {
				this.props.fetchProduct( site.ID, productId );
				this.props.fetchProductVariations( site.ID, productId );
				this.props.editProduct( site.ID, { id: productId }, {} );
			}
			this.props.fetchProductCategories( site.ID );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { params, site } = this.props;
		const productId = Number( params.product );
		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProduct( newSiteId, productId );
			this.props.fetchProductVariations( newSiteId, productId );
			this.props.editProduct( newSiteId, { id: productId }, {} );
			this.props.fetchProductCategories( newSiteId );
		}
	}

	componentWillUnmount() {
		// TODO: Remove the product we added here from the edit state.
	}

	onTrash = () => {
		// TODO: Add action dispatch to trash this product.
	}

	onSave = () => {
		const { product, translate } = this.props;

		const successAction = successNotice(
			translate( '%(product)s successfully updated.', {
				args: { product: product.name },
			} ),
			{ duration: 4000 }
		);

		const failureAction = errorNotice(
			translate( 'There was a problem saving %(product)s. Please try again.', {
				args: { product: product.name },
			} )
		);

		this.props.createProductActionList( successAction, failureAction );
	}

	isProductValid( product = this.props.product ) {
		return product &&
			product.type &&
			product.name && product.name.length > 0;
	}

	render() {
		const { site, product, className, variations, productCategories, actionList } = this.props;

		const isValid = 'undefined' !== site && this.isProductValid();
		const isBusy = Boolean( actionList ); // If there's an action list present, we're trying to save.
		const saveEnabled = isValid && ! isBusy;

		return (
			<Main className={ className }>
				<SidebarNavigation />
				<ProductHeader
					site={ site }
					product={ product }
					onTrash={ this.onTrash }
					onSave={ saveEnabled ? this.onSave : false }
					isBusy={ isBusy }
				/>
				<ProductForm
					siteId={ site && site.ID }
					product={ product || { type: 'simple' } }
					variations={ variations }
					productCategories={ productCategories }
					editProduct={ this.props.editProduct }
					editProductCategory={ this.props.editProductCategory }
					editProductAttribute={ this.props.editProductAttribute }
					editProductVariation={ this.props.editProductVariation }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const product = getCurrentlyEditingProduct( state );
	const variations = product && getProductVariationsWithLocalEdits( state, product.id );
	const productCategories = getProductCategoriesWithLocalEdits( state );
	const actionList = getActionList( state );

	return {
		site,
		product,
		variations,
		productCategories,
		actionList,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createProduct,
			createProductActionList,
			editProduct,
			editProductCategory,
			editProductAttribute,
			editProductVariation,
			fetchProduct,
			fetchProductVariations,
			fetchProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductUpdate ) );
