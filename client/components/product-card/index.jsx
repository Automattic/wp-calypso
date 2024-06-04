import { Card, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ProductCardPriceGroup from './price-group';

import './style.scss';

function ProductCard( {
	billingTimeFrame,
	children,
	currencyCode,
	description,
	discountedPrice,
	fullPrice,
	isPlaceholder,
	purchase,
	subtitle,
	title,
} ) {
	const hasPriceGroup = ! purchase && !! currencyCode && !! billingTimeFrame;
	const cardClassNames = clsx( 'product-card', {
		'is-placeholder': isPlaceholder,
		'is-purchased': !! purchase,
		'has-secondary-header': subtitle || hasPriceGroup,
	} );

	return (
		<Card className={ cardClassNames }>
			<div className="product-card__header">
				{ title && (
					<div className="product-card__header-primary">
						{ purchase && <Gridicon icon="checkmark" size={ 18 } /> }
						<h3 className="product-card__title">{ title }</h3>
					</div>
				) }
			</div>
			{ description && (
				<div className="product-card__description">
					<p>{ description }</p>
				</div>
			) }
			{ children }
			{ ( subtitle || hasPriceGroup ) && (
				<div className="product-card__secondary">
					{ subtitle && <div className="product-card__subtitle">{ subtitle }</div> }
					{ ! subtitle && hasPriceGroup && (
						<ProductCardPriceGroup
							billingTimeFrame={ billingTimeFrame }
							currencyCode={ currencyCode }
							discountedPrice={ discountedPrice }
							fullPrice={ fullPrice }
						/>
					) }
				</div>
			) }
		</Card>
	);
}

ProductCard.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	description: PropTypes.node,
	discountedPrice: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.arrayOf( PropTypes.number ),
	] ),
	fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
	isPlaceholder: PropTypes.bool,
	purchase: PropTypes.object,
	subtitle: PropTypes.node,
	title: PropTypes.node,
};

export default localize( ProductCard );
