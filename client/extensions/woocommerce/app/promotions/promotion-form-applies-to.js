/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import TreeSelector from 'woocommerce/components/tree-selector';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import {
	editCategoryIdSelected,
	editProductIdSelected,
	editCategoryProductIdsSelected,
	hasCategory,
} from './helpers';
import {
	editPromotion,
} from 'woocommerce/state/ui/promotions/actions';
import { getProductCategories } from 'woocommerce/state/sites/product-categories/selectors';
import { getPromotionableProducts } from 'woocommerce/state/selectors/promotions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	isCategorySelected,
	isProductSelected,
} from 'woocommerce/state/sites/promotions/helpers';

function generateProductNode( promotion, product ) {
	return {
		key: 'product:' + product.id,
		label: product.name,
		selected: isProductSelected( promotion, product ),
		product,
	};
}

function generateCategoryTree( promotion, category, products, onCategorySelect ) {
	const categoryProducts = products.filter(
		( p ) => hasCategory( p, category.id )
	).sort(
		( a, b ) => a.name.localeCompare( b.name )
	);
	const categoryProductNodes = categoryProducts.map(
		( product ) => generateProductNode( promotion, product )
	);

	return {
		key: 'cat:' + category.id,
		label: category.name,
		selected: isCategorySelected( promotion, category ),
		category,
		onSelect: onCategorySelect,
		children: categoryProductNodes,
	};
}

function generateUncategorizedTree( promotion, products, translate ) {
	const uncategorizedProducts = products.filter(
		( p ) => ( ! p.categories || 0 === p.categories.length )
	).sort(
		( a, b ) => a.name.localeCompare( b.name )
	);
	const uncategorizedProductNodes = uncategorizedProducts.map(
		( product ) => generateProductNode( promotion, product )
	);

	return {
		key: 'uncategorized',
		label: translate( 'Uncategorized' ),
		onSelect: null,
		children: uncategorizedProductNodes,
	};
}

function generateTree( promotion, products, productCategories, translate, onAllSelect, onCategorySelect ) {
	// Only generate tree if we have our data. Otherwise show placeholders.
	if ( ! products || ! productCategories ) {
		return null;
	}

	const categoryNodes = productCategories.sort(
		( a, b ) => a.name.localeCompare( b.name )
	).map(
		( category ) => generateCategoryTree( promotion, category, products, onCategorySelect )
	);

	const uncategorized = generateUncategorizedTree( promotion, products, translate );
	const isAllSelected = get( promotion, [ 'appliesTo', 'all' ], false );

	return {
		key: 'all',
		label: translate( 'All Products' ),
		onSelect: onAllSelect,
		selected: isAllSelected,
		children: [ ...categoryNodes, uncategorized ],
	};
}

class PromotionFormAppliesTo extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
		products: PropTypes.array,
		productCategories: PropTypes.array,
	};

	updateAllSelection = ( node, selected ) => {
		const { siteId, promotion } = this.props;

		// checking or unchecking all always clears
		// the products and categories either way
		const newAppliesTo = {
			all: selected,
		};
		const newPromotion = { ...promotion, appliesTo: newAppliesTo };
		this.props.editPromotion( siteId, promotion, newPromotion );
	}

	updateCategorySelection = ( categoryNode, selected ) => {
		const { siteId, promotion, products } = this.props;
		const appliesTo = promotion.appliesTo || {};
		const categoryIds = appliesTo.productCategoryIds || [];
		const productIds = appliesTo.productIds || [];
		const { category } = categoryNode;

		const newAppliesTo = {
			...appliesTo,
			productCategoryIds: editCategoryIdSelected( categoryIds, category.id, selected ),
			productIds: editCategoryProductIdsSelected( productIds, category.id, false, products ),
		};

		const newPromotion = { ...promotion, appliesTo: newAppliesTo };
		this.props.editPromotion( siteId, promotion, newPromotion );
	}

	updateProductSelection = ( productNode, selected ) => {
		const { siteId, promotion } = this.props;
		const appliesTo = promotion.appliesTo || {};
		const productIds = appliesTo.productIds || [];
		const { product } = productNode;

		const newAppliesTo = {
			...appliesTo,
			productIds: editProductIdSelected( productIds, product.id, selected )
		};
		const newPromotion = { ...promotion, appliesTo: newAppliesTo };
		this.props.editPromotion( siteId, promotion, newPromotion );
	}

	render() {
		const {
			promotion,
			products,
			productCategories,
			translate,
		} = this.props;

		const tree = generateTree(
			promotion,
			products,
			productCategories,
			translate,
			this.updateAllSelection,
			this.updateCategorySelection
		);
		const nodes = ( tree ? [ tree ] : null );

		return (
			<FormFieldset className="promotions__promotion-form-applies-to">
				<FormLabel>{ translate( 'Applies to' ) }</FormLabel>
				<TreeSelector nodes={ nodes } onNodeSelect={ this.updateProductSelection } />
			</FormFieldset>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = ( site ? site.ID : null );
	const products = getPromotionableProducts( state, siteId );
	const productCategories = getProductCategories( state, siteId );

	return {
		siteId,
		products,
		productCategories,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editPromotion,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PromotionFormAppliesTo ) );

