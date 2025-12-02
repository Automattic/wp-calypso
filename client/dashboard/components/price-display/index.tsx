import { getCurrencyObject } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { Text } from '../text';

function Currency( { symbol, discounted }: { symbol: string; discounted: boolean } ) {
	return (
		<Text
			variant={ discounted ? 'muted' : undefined }
			size={ discounted ? 8 : 14 }
			lineHeight={ discounted ? '20px' : '24px' }
		>
			{ symbol }
		</Text>
	);
}

export function PriceDisplay( {
	price,
	currency,
	discounted = false,
}: {
	price: number;
	currency: string;
	discounted?: boolean;
} ) {
	const priceObj = getCurrencyObject( price, currency );

	return (
		<HStack expanded={ false } spacing={ discounted ? 0.5 : 1 } alignment="topLeft">
			{ priceObj.symbolPosition === 'before' ? (
				<Currency symbol={ priceObj.symbol } discounted={ discounted } />
			) : null }
			<Text
				as={ discounted ? 's' : 'span' }
				variant={ discounted ? 'muted' : undefined }
				size={ discounted ? 20 : 40 }
				lineHeight={ discounted ? '26px' : '40px' }
				weight={ 400 }
			>
				{ priceObj.integer }
				{ priceObj.hasNonZeroFraction && priceObj.fraction }
			</Text>
			{ priceObj.symbolPosition === 'after' ? (
				<Currency symbol={ priceObj.symbol } discounted={ discounted } />
			) : null }
		</HStack>
	);
}
