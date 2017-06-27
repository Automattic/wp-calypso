/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { successNotice, errorNotice } from 'state/notices/actions';
import { editProduct, editProductAttribute, createProductActionList } from 'woocommerce/state/ui/products/actions';
import { editProductCategory } from 'woocommerce/state/ui/product-categories/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { actionListStepNext } from 'woocommerce/state/action-list/actions';
import { getCurrentlyEditingProduct } from 'woocommerce/state/ui/products/selectors';
import { getProductVariationsWithLocalEdits } from 'woocommerce/state/ui/products/variations/selectors';
import { editProductVariation } from 'woocommerce/state/ui/products/variations/actions';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getProductCategoriesWithLocalEdits } from 'woocommerce/state/ui/product-categories/selectors';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import ProductForm from './product-form';
import ProductHeader from './product-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';

class ProductCreate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		fetchProductCategories: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductCategory: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { product, site } = this.props;

		if ( site && site.ID ) {
			if ( ! product ) {
				this.props.editProduct( site.ID, null, {
					type: 'simple'
				} );
			}
			this.props.fetchProductCategories( site.ID );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.editProduct( newSiteId, null, {
				type: 'simple'
			} );
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
			translate( '%(product)s successfully created.', {
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
		this.props.actionListStepNext();
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
			actionListStepNext,
			createProduct,
			createProductActionList,
			editProduct,
			editProductCategory,
			editProductAttribute,
			editProductVariation,
			fetchProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCreate ) );
