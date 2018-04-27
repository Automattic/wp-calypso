/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { uniqueId, get, find } from 'lodash';
import warn from 'lib/warn';

/**
 * Internal dependencies
 */
import PromotionFormCard from './promotion-form-card';
import PromotionFormTypeCard from './promotion-form-type-card';
import promotionModels from './promotion-models';

function renderPlaceholder() {
	const { className } = this.props;
	return (
		<div className={ classNames( 'promotions__form', 'is-placeholder', className ) }>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
}

export default class PromotionForm extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		currency: PropTypes.string,
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
		products: PropTypes.array,
		showEmptyValidationErrors: PropTypes.bool,
	};

	calculatePromotionName = ( promotion ) => {
		const { products } = this.props;

		switch ( promotion.type ) {
			case 'fixed_discount':
			case 'fixed_cart':
			case 'percent':
				return promotion.couponCode;
			case 'product_sale':
				const productIds = get( promotion, [ 'appliesTo', 'productIds' ], [] );
				const productId = ( productIds.length > 0 ? productIds[ 0 ] : null );
				const product = productId && find( products, { id: productId } );
				return ( product ? product.name : '' );
		}
	}

	editPromotionWithNameUpdate = ( siteId, promotion, data ) => {
		const name = this.calculatePromotionName( { ...promotion, ...data } );
		const adjustedData = { ...data, name };

		return this.props.editPromotion( siteId, promotion, adjustedData );
	}

	renderFormCards( promotion ) {
		const { siteId, currency, showEmptyValidationErrors } = this.props;
		const model = promotionModels[ promotion.type ];
		const editPromotion = this.editPromotionWithNameUpdate;

		if ( ! model ) {
			warn( 'No model found for promotion type: ' + promotion.type );
			return null;
		}

		return Object.keys( model ).map( ( key ) => {
			const cardModel = model[ key ];
			return (
				<PromotionFormCard key={ key } { ...{
					cardModel,
					siteId,
					currency,
					promotion,
					editPromotion,
					showEmptyValidationErrors,
				} } />
			);
		} );
	}

	render() {
		const { siteId, editPromotion } = this.props;

		if ( ! siteId ) {
			return renderPlaceholder();
		}

		const promotion = this.props.promotion ||
			{ id: { placeholder: uniqueId( 'promotion_' ) }, type: 'fixed_product' };

		return (
			<div className={ classNames( 'promotions__form', this.props.className ) }>
				<PromotionFormTypeCard { ...{ siteId, promotion, editPromotion } } />
				{ this.renderFormCards( promotion ) }
			</div>
		);
	}
}
