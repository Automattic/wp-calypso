import { PlanPrice } from '@automattic/components';
import clsx from 'clsx';
import { isNumber } from 'lodash';
import PropTypes from 'prop-types';

const ProductCardPriceGroup = ( props ) => {
	const { billingTimeFrame, currencyCode, discountedPrice, fullPrice } = props;
	const isDiscounted = isNumber( discountedPrice );
	const priceGroupClasses = clsx( 'product-card__price-group', {
		'is-discounted': isDiscounted,
	} );

	return (
		<div className={ priceGroupClasses }>
			<PlanPrice currencyCode={ currencyCode } rawPrice={ fullPrice } original={ isDiscounted } />
			{ isDiscounted && (
				<PlanPrice currencyCode={ currencyCode } rawPrice={ discountedPrice } discounted />
			) }
			<div className="product-card__billing-timeframe">{ billingTimeFrame }</div>
		</div>
	);
};

ProductCardPriceGroup.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	discountedPrice: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.arrayOf( PropTypes.number ),
	] ),
	fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
};

export default ProductCardPriceGroup;
