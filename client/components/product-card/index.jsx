/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import ProductCardPriceGroup from './price-group';

/**
 * Style dependencies
 */
import './style.scss';

const ProductCard = ( {
	billingTimeFrame,
	children,
	currencyCode,
	description,
	discountedPrice,
	fullPrice,
	hasManageSubscriptionLink,
	isPlaceholder,
	isPurchased,
	subtitle,
	title,
} ) => {
	const translate = useTranslate();
	const cardClassNames = classNames( 'product-card', {
		'is-placeholder': isPlaceholder,
		'is-purchased': isPurchased,
	} );

	return (
		<Card className={ cardClassNames }>
			<div className="product-card__header">
				{ title && (
					<div className="product-card__header-primary">
						{ isPurchased && <Gridicon icon="checkmark" size={ 18 } /> }
						<h3 className="product-card__title">{ title }</h3>
					</div>
				) }
				<div className="product-card__header-secondary">
					{ subtitle && <div className="product-card__subtitle">{ subtitle }</div> }
					{ ! isPurchased && (
						<ProductCardPriceGroup
							billingTimeFrame={ billingTimeFrame }
							currencyCode={ currencyCode }
							discountedPrice={ discountedPrice }
							fullPrice={ fullPrice }
						/>
					) }
				</div>
			</div>
			<div className="product-card__description">
				{ hasManageSubscriptionLink && (
					<p>
						<a href="/my-plan">{ translate( 'Manage subscriptions' ) }</a>
					</p>
				) }
				{ description }
			</div>
			{ children }
		</Card>
	);
};

ProductCard.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	discountedPrice: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.arrayOf( PropTypes.number ),
	] ),
	fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
	hasManageSubscriptionLink: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	isPurchased: PropTypes.bool,
	subtitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
};

export default ProductCard;
