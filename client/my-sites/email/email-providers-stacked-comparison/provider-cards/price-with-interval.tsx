import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import type { TranslateResult } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

type PriceWithIntervalProps = {
	className?: string;
	cost: number;
	currencyCode: string;
	hasDiscount: boolean;
	intervalLength: IntervalLength;
	sale?: number | null;
};

const PriceWithInterval: FunctionComponent< PriceWithIntervalProps > = ( props ) => {
	const { cost, currencyCode, hasDiscount, sale, intervalLength } = props;

	const showSale = sale && sale !== 0;

	const priceClassName = classNames( 'provider-cards__price-with-interval-price', {
		'provider-cards__price-with-interval-price-discounted': hasDiscount || showSale,
	} );

	const priceSpan = <span className={ priceClassName } />;
	const standardPrice = formatCurrency( cost ?? 0, currencyCode );

	const getSalePriceContents = (): TranslateResult => {
		const saleTranslateArguments = {
			salePrice: formatCurrency( sale ?? 0, currencyCode ),
			standardPrice,
		};
		const saleTranslateComponents = {
			priceSpan,
			saleSpan: <span className="provider-cards__price-with-interval-sale-price" />,
		};

		if ( intervalLength === IntervalLength.ANNUALLY ) {
			return translate(
				'{{priceSpan}}%(standardPrice)s{{/priceSpan}} {{saleSpan}}%(salePrice)s{{/saleSpan}} /year /mailbox',
				{
					args: saleTranslateArguments,
					comment:
						'%(standardPrice)s is a formatted standard price, e.g. $3.50; %(salePrice)s is a formatted sale price, e.g. $2.75',
					components: saleTranslateComponents,
				}
			);
		}

		return translate(
			'{{priceSpan}}%(standardPrice)s{{/priceSpan}} {{saleSpan}}%(salePrice)s{{/saleSpan}} /month /mailbox',
			{
				args: saleTranslateArguments,
				comment:
					'%(standardPrice)s is a formatted standard price, e.g. $3.50; %(salePrice)s is a formatted sale price, e.g. $2.75',
				components: saleTranslateComponents,
			}
		);
	};

	const getStandardPriceContents = (): TranslateResult => {
		const standardTranslateArguments = { standardPrice };
		const standardTranslateComponents = { priceSpan };

		if ( intervalLength === IntervalLength.ANNUALLY ) {
			return translate( '{{priceSpan}}%(standardPrice)s{{/priceSpan}} /year /mailbox', {
				args: standardTranslateArguments,
				comment: '%(standardPrice)s is a formatted standard price, e.g. $3.50',
				components: standardTranslateComponents,
			} );
		}

		return translate( '{{priceSpan}}%(standardPrice)s{{/priceSpan}} /month /mailbox', {
			args: standardTranslateArguments,
			comment: '%(standardPrice)s is a formatted standard price, e.g. $3.50',
			components: standardTranslateComponents,
		} );
	};

	const priceContent = showSale ? getSalePriceContents() : getStandardPriceContents();

	return <div className="provider-cards__price-with-interval">{ priceContent }</div>;
};

export default PriceWithInterval;
