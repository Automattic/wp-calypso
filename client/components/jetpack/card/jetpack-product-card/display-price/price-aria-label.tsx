import { useTranslate, formatCurrency } from 'i18n-calypso';
import TimeFrame from './time-frame';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';

interface Props {
	currencyCode: string;
	billingTerm: Duration;
	isDiscounted: boolean;
	discountPercentage?: number;
	finalPrice: number;
	originalPrice?: number;
	formattedOriginalPrice?: string;
	discountedPriceDuration?: number;
}

const formatOptions = { stripZeros: true };

const DiscountedPriceLabel: React.FC< Props > = ( { originalPrice, finalPrice, currencyCode } ) => {
	const translate = useTranslate();

	return (
		<>
			{ translate( '%(finalPrice)s instead of %(originalPrice)s', {
				args: {
					finalPrice: formatCurrency( finalPrice, currencyCode, formatOptions ),
					originalPrice: formatCurrency( originalPrice as number, currencyCode, formatOptions ),
				},
			} ) }
		</>
	);
};

export const PriceAriaLabel: React.FC< Props > = ( props ) => {
	const { finalPrice, originalPrice, currencyCode, isDiscounted } = props;

	return (
		<span className="screen-reader-text">
			{ isDiscounted && originalPrice ? (
				<DiscountedPriceLabel { ...props } />
			) : (
				formatCurrency( finalPrice, currencyCode, formatOptions )
			) }{ ' ' }
			<TimeFrame { ...props } forScreenReader />
		</span>
	);
};

export default PriceAriaLabel;
