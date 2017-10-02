/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get } from 'lodash';

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
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		product: PropTypes.object.isRequired,
	};

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

	handleClick = () => {
		const { product } = this.props;
		this.props.onClick( product );
	};

	createTextWithHighlight = ( text, highlightedText ) => {
		highlightedText = highlightedText.toLowerCase();
		const re = new RegExp( '(' + highlightedText + ')', 'gi' );
		const parts = text.split( re );
		const token = parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			if ( lowercasePart === highlightedText ) {
				return (
					<span key={ key } className="product-search__value-emphasis">
						{ part }
					</span>
				);
			}
			return (
				<span key={ key } className="product-search__value-normal">
					{ part }
				</span>
			);
		} );

		return token;
	};

	renderItem = product => {
		const { search } = this.props;
		const featuredImage = get( product, 'images[0]', false );
		return (
			<CompactCard
				key={ product.key }
				className="product-search__item"
				role="button"
				tabIndex="0"
				onClick={ this.handleClick }
				onKeyDown={ getKeyboardHandler( this.handleClick ) }
			>
				<div className="product-search__image">
					{ featuredImage && <img src={ featuredImage.src } /> }
				</div>
				<div className="product-search__label">
					<div className="product-search__name">
						{ this.createTextWithHighlight( product.name, search ) }
					</div>
					<div className="product-search__sku">{ product.sku }</div>
				</div>
			</CompactCard>
		);
	};

	render() {
		const { product, variations } = this.props;
		let productList = [ { ...product, key: product.id } ];

		if ( variations ) {
			productList = variations.map( v => {
				const name = product.name + ' – ' + formattedVariationName( v );
				const key = product.id + '-' + v.id;
				const images = v.image ? [ v.image ] : product.images;
				return { ...product, name, key, images, sku: v.sku, variation: v.id };
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
			siteId: get( site, 'ID' ),
			variations: getVariationsForProduct( state, productId ),
		};
	},
	dispatch => bindActionCreators( { fetchProductVariations }, dispatch )
)( ProductItem );
