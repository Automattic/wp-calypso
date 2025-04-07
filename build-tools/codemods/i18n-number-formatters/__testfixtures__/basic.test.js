const { defineInlineTest } = require( 'jscodeshift/dist/testUtils' );
const transform = require( '../transform' );

jest.autoMockOff();

const input = `
import { numberFormat, numberFormatCompact, formatCurrency, getCurrencyObject } from 'i18n-calypso';
import { Component } from 'react';

export function StatsCard({ value, currency }) {
    const formattedNumber = numberFormat(value);
    const compactNumber = numberFormatCompact(value);
    const currencyValue = formatCurrency(value, currency);
    const currencyObject = getCurrencyObject(currency);
    return null;
}
`;

const output = `
import { formatCurrency, formatNumber, formatNumberCompact, getCurrencyObject } from '@automattic/number-formatters';
import { Component } from 'react';

export function StatsCard({ value, currency }) {
    const formattedNumber = formatNumber(value);
    const compactNumber = formatNumberCompact(value);
    const currencyValue = formatCurrency(value, currency);
    const currencyObject = getCurrencyObject(currency);
    return null;
}
`;

defineInlineTest(
	transform,
	{ parser: 'tsx' },
	input,
	output,
	'transforms i18n-calypso number formatters'
);
