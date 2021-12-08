import formatCurrency from '@automattic/format-currency';
import { translate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';

type PriceWithIntervalProps = {
	className: string;
	cost: number;
	currencyCode: string;
	hasDiscount: boolean;
	intervalLength: IntervalLength;
	sale?: number | null;
};

const PriceWithInterval: FunctionComponent< PriceWithIntervalProps > = ( props ) => {
	const { className, cost, currencyCode, hasDiscount, sale, intervalLength } = props;

	const priceClassName = `${ className }__${
		hasDiscount ? 'discounted-price' : 'keep-main-price'
	}`;
	const intervalLengthClassName = `${ className }__interval`;
	const mailboxClassName = `${ className }__mailbox`;
	const saleClassName = `${ className }__sale`;

	const showSale = sale && sale !== 0;

	const lineThrough = {
		textDecoration: hasDiscount || showSale ? 'line-through' : 'solid ',
	};

	const priceSpan = (
		<span style={ lineThrough } className={ priceClassName }>
			{ formatCurrency( cost ?? 0, currencyCode ) }
		</span>
	);

	const saleSpan = showSale && (
		<span className={ saleClassName }>{ formatCurrency( sale ?? 0, currencyCode ) }</span>
	);

	const intervalLengthSpan = (
		<span className={ intervalLengthClassName }>
			{ intervalLength === IntervalLength.ANNUALLY ? translate( '/year' ) : translate( '/month' ) }
		</span>
	);

	const mailboxSpan = <span className={ mailboxClassName }>{ translate( '/mailbox' ) } </span>;

	return (
		<>
			{ priceSpan } { saleSpan } { mailboxSpan } { intervalLengthSpan }
		</>
	);
};

export default PriceWithInterval;
