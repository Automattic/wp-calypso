import { formatCurrency } from '@automattic/number-formatters';
import { translate } from 'i18n-calypso';
import { hasIntroductoryOfferFreeTrial } from 'calypso/lib/emails';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './style.scss';

const getSalePrice = ( {
	isDiscounted,
	product,
}: {
	isDiscounted: boolean;
	product: ProductListItem | null;
} ) => {
	if ( hasIntroductoryOfferFreeTrial( product ) ) {
		return 0;
	}
	if ( isDiscounted ) {
		return product?.sale_cost ?? 0;
	}
	return product?.introductory_offer?.cost_per_interval ?? 0;
};

const SalePriceWithInterval = ( {
	intervalLength,
	salePrice,
	standardPrice,
}: {
	intervalLength: IntervalLength;
	salePrice: string;
	standardPrice: string;
} ) => {
	const translateArguments = {
		args: {
			salePrice,
			standardPrice,
		},
		comment:
			"%(standardPrice)s and %(salePrice)s are formatted prices with the currency (e.g. '$5'), {{priceSpan}} and {{saleSpan}} are <span> HTML tags",
		components: {
			priceSpan: <span className="price-with-interval__price-discounted" />,
			saleSpan: <span className="price-with-interval__sale-price" />,
		},
	};

	if ( intervalLength === IntervalLength.ANNUALLY ) {
		return (
			<>
				{ translate(
					'{{priceSpan}}%(standardPrice)s{{/priceSpan}} {{saleSpan}}%(salePrice)s{{/saleSpan}} /year /mailbox',
					translateArguments
				) }
			</>
		);
	}

	return (
		<>
			{ translate(
				'{{priceSpan}}%(standardPrice)s{{/priceSpan}} {{saleSpan}}%(salePrice)s{{/saleSpan}} /month /mailbox',
				translateArguments
			) }
		</>
	);
};

const StandardPriceWithInterval = ( {
	intervalLength,
	standardPrice,
}: {
	intervalLength: IntervalLength;
	standardPrice: string;
} ) => {
	const translateArguments = {
		args: { standardPrice },
		comment:
			"%(standardPrice)s is a formatted price with the currency (e.g. '$5'), {{span}} is an <span> HTML tag",
		components: { span: <span /> },
	};

	if ( intervalLength === IntervalLength.ANNUALLY ) {
		return (
			<>{ translate( '{{span}}%(standardPrice)s{{/span}} /year /mailbox', translateArguments ) }</>
		);
	}

	return (
		<>{ translate( '{{span}}%(standardPrice)s{{/span}} /month /mailbox', translateArguments ) }</>
	);
};

const PriceWithInterval = ( {
	currencyCode,
	intervalLength,
	isDiscounted = false,
	isEligibleForIntroductoryOffer,
	product,
}: {
	currencyCode: string | null;
	intervalLength: IntervalLength;
	isDiscounted?: boolean;
	isEligibleForIntroductoryOffer: boolean;
	product: ProductListItem | null;
} ) => {
	const standardPrice = formatCurrency( product?.cost ?? 0, currencyCode ?? '', {
		stripZeros: true,
	} );

	if ( isDiscounted || isEligibleForIntroductoryOffer ) {
		const salePrice = formatCurrency(
			getSalePrice( { isDiscounted, product } ),
			currencyCode ?? '',
			{ stripZeros: true }
		);

		return (
			<SalePriceWithInterval
				intervalLength={ intervalLength }
				salePrice={ salePrice }
				standardPrice={ standardPrice }
			/>
		);
	}

	return (
		<StandardPriceWithInterval intervalLength={ intervalLength } standardPrice={ standardPrice } />
	);
};

export default PriceWithInterval;
