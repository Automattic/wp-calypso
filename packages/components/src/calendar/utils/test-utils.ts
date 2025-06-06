import { screen } from '@testing-library/react';

export const monthNameFormatter = ( localeCode: string, timeZone?: string ) =>
	new Intl.DateTimeFormat( localeCode, {
		year: 'numeric',
		month: 'long',
		timeZone,
	} );

const fullDateFormatter = ( localeCode: string, timeZone?: string ) =>
	new Intl.DateTimeFormat( localeCode, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone,
	} );

export const dateNumberFormatter = ( localeCode: string, timeZone?: string ) =>
	new Intl.DateTimeFormat( localeCode, {
		day: 'numeric',
		timeZone,
	} );

export const getDateButton = (
	date: Date,
	options?: Parameters< typeof screen.getByRole >[ 1 ],
	locale = 'en-US'
) =>
	screen.getByRole( 'button', {
		name: new RegExp( fullDateFormatter( locale ).format( date ) ),
		...options,
	} );

export const getDateCell = (
	date: Date,
	options?: Parameters< typeof screen.getByRole >[ 1 ],
	locale = 'en-US'
) =>
	screen.getByRole( 'gridcell', {
		name: dateNumberFormatter( locale ).format( date ),
		...options,
	} );

export const queryDateCell = (
	date: Date,
	options?: Parameters< typeof screen.getByRole >[ 1 ],
	locale = 'en-US'
) =>
	screen.queryByRole( 'gridcell', {
		name: dateNumberFormatter( locale ).format( date ),
		...options,
	} );
