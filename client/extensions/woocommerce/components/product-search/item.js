/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { fetchProductVariations } from 'woocommerce/state/sites/product-variations/actions';
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import getKeyboardHandler from 'woocommerce/lib/get-keyboard-handler';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getVariationsForProduct } from 'woocommerce/state/sites/product-variations/selectors';

class ProductItem extends Component {
	componentDidMount() {
		const { siteId, productId } = this.props;

		if ( siteId ) {
			this.props.fetchProductVariations( siteId, productId );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { siteId, productId } = this.props;
		if ( newProps.productId !== productId || newProps.siteId !== siteId ) {
			this.props.fetchProductVariations( newProps.siteId, newProps.productId );
		}
	}

	onClick = () => {
		const { product } = this.props;
		this.props.onClick( product );
	};

	renderItem = product => {
		const featuredImage = product.images && product.images[ 0 ];
		return (
			<CompactCard
				key={ product.key }
				className="product-search__item"
				role="button"
				tabIndex="0"
				onClick={ this.onClick }
				onKeyDown={ getKeyboardHandler( this.onClick ) }
			>
				<div className="product-search__image">
					{ featuredImage && <img src={ featuredImage.src } /> }
				</div>
				<div className="product-search__label">
					<div className="product-search__name">{ product.name }</div>
					<div className="product-search__sku">{ product.sku }</div>
				</div>
			</CompactCard>
		);
	};

	render() {
		const { product, variations } = this.props;
		let productList = [ { ...product, key: product.id } ];

		if ( variations.length ) {
			productList = variations.map( v => {
				const name = product.name + ' – ' + formattedVariationName( v );
				const key = product.id + '-' + v.id;
				return { ...product, name, key, sku: v.sku, variation: v.id };
			} );
		}

		return <div>{ productList.map( this.renderItem ) }</div>;
	}
}

export default connect(
	( state, props ) => {
		const productId = props.product.id;
		const site = getSelectedSiteWithFallback( state );

		return {
			productId,
			siteId: site && site.ID,
			variations: getVariationsForProduct( state, productId ) || [],
		};
	},
	dispatch => bindActionCreators( { fetchProductVariations }, dispatch )
)( ProductItem );
