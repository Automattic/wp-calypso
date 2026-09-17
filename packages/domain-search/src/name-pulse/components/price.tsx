import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalText as Text } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import type { NamePulseDomainResult } from '../helpers';

const formatPrice = ( amount: number, currencyCode: string ) =>
	formatCurrency( amount, currencyCode, { stripZeros: true } );

/**
 * Only `sale_cost` is a bare number, so a sale needs a known currency to render.
 */
export const hasSalePrice = ( {
	sale_cost: saleCost,
	currency_code: currencyCode,
}: NamePulseDomainResult ) => typeof saleCost === 'number' && !! currencyCode;

export const getResultPrices = ( {
	cost,
	raw_price: rawPrice,
	sale_cost: saleCost,
	currency_code: currencyCode,
}: NamePulseDomainResult ) => {
	const yearlyPrice =
		typeof rawPrice === 'number' && currencyCode ? formatPrice( rawPrice, currencyCode ) : cost;

	if ( ! yearlyPrice ) {
		return undefined;
	}

	const salePrice =
		typeof saleCost === 'number' && currencyCode
			? formatPrice( saleCost, currencyCode )
			: undefined;

	return { yearlyPrice, salePrice };
};

export const Price = ( { result }: { result: NamePulseDomainResult } ) => {
	const { __ } = useI18n();
	const prices = getResultPrices( result );

	if ( ! prices ) {
		return null;
	}

	const { yearlyPrice, salePrice } = prices;
	const isSale = !! salePrice;

	return (
		<span className={ clsx( 'name-pulse-row__price', isSale && 'name-pulse-row__price--sale' ) }>
			<span className="name-pulse-row__price-line">
				<Text
					weight={ 600 }
					color={ isSale ? 'var( --domain-search-promotional-price-color )' : undefined }
				>
					{ salePrice ?? yearlyPrice }
				</Text>
				<Text size={ 12 } variant="muted">
					{ isSale ? __( '/first year' ) : __( '/year' ) }
				</Text>
			</span>
			{ isSale && (
				<Text size={ 12 } variant="muted">
					{ sprintf(
						// translators: %(price)s is the domain renewal price.
						__( '%(price)s/year renewal' ),
						{ price: yearlyPrice }
					) }
				</Text>
			) }
		</span>
	);
};
