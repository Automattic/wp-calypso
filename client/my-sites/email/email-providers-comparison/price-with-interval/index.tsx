import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { ReactElement } from 'react';

import './style.scss';

type PriceWithIntervalProps = {
	cost: number;
	currencyCode: string;
	hasDiscount: boolean;
	intervalLength: IntervalLength;
	sale?: number | null;
};

const PriceWithInterval = ( {
	cost,
	currencyCode,
	hasDiscount,
	intervalLength,
	sale,
}: PriceWithIntervalProps ): ReactElement => {
	const showSale = sale && sale !== 0;

	const priceClassName = classNames( {
		'price-with-interval__price-discounted': hasDiscount || showSale,
	} );

	const priceSpan = <span className={ priceClassName } />;
	const standardPrice = formatCurrency( cost ?? 0, currencyCode );

	if ( showSale ) {
		const saleTranslateArguments = {
			salePrice: formatCurrency( sale ?? 0, currencyCode ),
			standardPrice,
		};

		const saleTranslateComponents = {
			priceSpan,
			saleSpan: <span className="price-with-interval__sale-price" />,
		};

		if ( intervalLength === IntervalLength.ANNUALLY ) {
			return (
				<>
					{ translate(
						'{{priceSpan}}%(standardPrice)s{{/priceSpan}} {{saleSpan}}%(salePrice)s{{/saleSpan}} /year /mailbox',
						{
							args: saleTranslateArguments,
							comment:
								'%(standardPrice)s is a formatted standard price, e.g. $3.50; %(salePrice)s is a formatted sale price, e.g. $2.75',
							components: saleTranslateComponents,
						}
					) }
				</>
			);
		}

		return (
			<>
				{ translate(
					'{{priceSpan}}%(standardPrice)s{{/priceSpan}} {{saleSpan}}%(salePrice)s{{/saleSpan}} /month /mailbox',
					{
						args: saleTranslateArguments,
						comment:
							'%(standardPrice)s is a formatted standard price, e.g. $3.50; %(salePrice)s is a formatted sale price, e.g. $2.75',
						components: saleTranslateComponents,
					}
				) }
			</>
		);
	}

	const standardTranslateArguments = { standardPrice };
	const standardTranslateComponents = { priceSpan };

	if ( intervalLength === IntervalLength.ANNUALLY ) {
		return (
			<>
				{ translate( '{{priceSpan}}%(standardPrice)s{{/priceSpan}} /year /mailbox', {
					args: standardTranslateArguments,
					comment: '%(standardPrice)s is a formatted standard price, e.g. $3.50',
					components: standardTranslateComponents,
				} ) }
			</>
		);
	}

	return (
		<>
			{ translate( '{{priceSpan}}%(standardPrice)s{{/priceSpan}} /month /mailbox', {
				args: standardTranslateArguments,
				comment: '%(standardPrice)s is a formatted standard price, e.g. $3.50',
				components: standardTranslateComponents,
			} ) }
		</>
	);
};

export default PriceWithInterval;
