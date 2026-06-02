import { sendReceiptEmailMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { receiptRoute } from '../../app/router/me';
import { isAkismetPro500Plan } from '../../utils/akismet';
import { getTaxName } from '../../utils/tax';
import {
	formatReceiptAmount,
	formatReceiptTaxAmount,
	getTransactionTermLabel,
	groupDomainProducts,
	renderTransactionQuantitySummary,
	summarizeReceiptItems,
	transactionIncludesTax,
} from './utils';
import type { CountryListItem, Receipt } from '@automattic/api-core';
import type { Fields, Operator, SortDirection, View } from '@wordpress/dataviews';

import './styles.scss';

export const WIDE_FIELDS = [ 'date', 'service', 'type', 'amount' ];
export const DESKTOP_FIELDS = [ 'date', 'service' ];
export const MOBILE_FIELDS: string[] = [ 'service' ];

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 10,
	fields: WIDE_FIELDS,
	sort: {
		field: 'date',
		direction: 'desc' as SortDirection,
	},
	layout: {
		density: 'balanced',
		styles: {
			date: {
				width: '14%',
			},
			service: {
				width: '43%',
			},
			type: {
				width: '20%',
			},
			amount: {
				width: '23%',
			},
		},
	},
};

export function useActions() {
	const navigate = useNavigate();
	const { mutate: sendEmail } = useMutation( {
		...sendReceiptEmailMutation(),
		meta: {
			snackbar: {
				success: __( 'Your receipt was sent by email successfully.' ),
				error: __(
					'There was a problem sending your receipt. Please try again later or contact support.'
				),
			},
		},
	} );

	return useMemo(
		() => [
			{
				id: 'view-receipt',
				isPrimary: true,
				label: __( 'View receipt' ),
				isEligible: ( item: Receipt ) => Boolean( item.id ),
				callback: ( items: Receipt[] ) => {
					const item = items[ 0 ];
					navigate( {
						to: receiptRoute.fullPath,
						params: { receiptId: item.id },
					} );
				},
			},
			{
				id: 'email-receipt',
				label: __( 'Email receipt' ),
				isEligible: ( item: Receipt ) => Boolean( item.id ),
				callback: ( items: Receipt[] ) => {
					const item = items[ 0 ];
					sendEmail( String( item.id ) );
				},
			},
		],
		[ navigate, sendEmail ]
	);
}

export function getFields(
	receipts: Receipt[],
	countryList: CountryListItem[] = [],
	visibleFields: string[] = WIDE_FIELDS
): Fields< Receipt > {
	return [
		{
			id: 'date',
			label: __( 'Date' ),
			type: 'text' as const,
			enableHiding: false,
			enableGlobalSearch: true,
			enableSorting: true,
			sort: ( firstReceipt: Receipt, secondReceipt: Receipt, direction: string ) => {
				return direction === 'asc'
					? new Date( firstReceipt.date ).getTime() - new Date( secondReceipt.date ).getTime()
					: new Date( secondReceipt.date ).getTime() - new Date( firstReceipt.date ).getTime();
			},
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			elements: getDatesForFiltering( receipts ),
			getValue: ( { item }: { item: Receipt } ) => {
				return getDateForFiltering( item );
			},
			render: ( { item }: { item: Receipt } ) => {
				return <time>{ formatReceiptDate( item ) }</time>;
			},
		},
		{
			id: 'service',
			label: __( 'App' ),
			type: 'text' as const,
			enableHiding: false,
			enableGlobalSearch: true,
			enableSorting: true,
			sort: ( firstReceipt: Receipt, secondReceipt: Receipt, direction: string ) => {
				const { label: firstLabel } = summarizeReceiptItems( firstReceipt.items );
				const { label: secondLabel } = summarizeReceiptItems( secondReceipt.items );
				return direction === 'asc'
					? String( firstLabel ).localeCompare( String( secondLabel ) )
					: String( secondLabel ).localeCompare( String( firstLabel ) );
			},
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			elements: getServicesForFiltering( receipts ),
			getValue: ( { item }: { item: Receipt } ) => {
				return getServiceForFiltering( item );
			},
			render: ( { item }: { item: Receipt } ) => {
				return (
					<VStack spacing={ 1 }>
						<Link
							to={ receiptRoute.fullPath }
							params={ { receiptId: item.id } }
							title={ __( 'View receipt' ) }
							className="receipts-link-to-receipt"
						>
							{ renderServiceNameDescription( item ) }
						</Link>
						{ renderInlineHiddenFields( item, visibleFields ) }
					</VStack>
				);
			},
		},
		{
			id: 'type',
			label: __( 'Type' ),
			type: 'text' as const,
			enableHiding: false,
			enableGlobalSearch: true,
			enableSorting: true,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			elements: getReceiptItemTypesForFiltering( receipts ),
			getValue: ( { item }: { item: Receipt } ) => {
				return getReceiptItemTypeForDisplay( item );
			},
			render: ( { item }: { item: Receipt } ) => {
				return (
					<Text isBlock variant="muted" size="13">
						{ getReceiptItemTypeForDisplay( item ) }
					</Text>
				);
			},
		},
		{
			id: 'amount',
			label: __( 'Amount' ),
			type: 'text' as const,
			enableHiding: false,
			enableGlobalSearch: true,
			enableSorting: true,
			sort: ( firstReceipt: Receipt, secondReceipt: Receipt, direction: string ) => {
				return direction === 'asc'
					? firstReceipt.amount_integer - secondReceipt.amount_integer
					: secondReceipt.amount_integer - firstReceipt.amount_integer;
			},
			filterBy: false,
			getValue: ( { item }: { item: Receipt } ) => {
				// Since we aren't using this value for sorting, filtering, or
				// display, we can optimize it specifically for search.
				const search_data = [ item.currency, formatReceiptAmount( item ) ];
				if ( transactionIncludesTax( item ) ) {
					search_data.push( formatReceiptTaxAmount( item ) );
				}
				return search_data;
			},
			render: ( { item }: { item: Receipt } ) =>
				renderReceiptAmount( item, getTaxName( countryList, item.tax_country_code ) ),
		},
		{
			id: 'extra_receipt_data_for_search',
			// This empty space is a hack to prevent this hidden field from
			// having its ID listed in the "Hidden" section, when you click the
			// gear icon next to the view and scroll down to the bottom.
			// Ideally there would be a cleaner way to add content to search
			// without using a fake field like this at all.
			label: ' ',
			enableHiding: false,
			enableSorting: false,
			filterBy: false,
			enableGlobalSearch: true,
			// This function returns data from the other fields that could not
			// be returned there because it would interfere with their
			// getValue() implementations being used for sorting, filtering,
			// etc.
			getValue: ( { item }: { item: Receipt } ) => {
				const search_data = [];
				// Date field: Add the full date in a couple of formats, so
				// it's possible to search for e.g. "October 23" or "Oct 23".
				search_data.push(
					new Date( item.date ).toLocaleDateString( undefined, {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					} )
				);
				search_data.push(
					new Date( item.date ).toLocaleDateString( undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					} )
				);
				// App field: Include the overall field label and the label on
				// each receipt item (so that it's possible to search for items
				// within a multi-item receipt), as well as other data that is
				// shown with this field.
				const { groupedItems: receiptItems, label: receiptLabel } = summarizeReceiptItems(
					item.items
				);
				search_data.push( receiptLabel );
				search_data.push( ...receiptItems.map( ( receiptItem ) => receiptItem.variation ) );
				const receiptItem = receiptItems[ 0 ];
				if ( receiptItem.domain ) {
					search_data.push( receiptItem.domain );
				}
				const termLabel = getTransactionTermLabel( receiptItem );
				if ( termLabel ) {
					search_data.push( termLabel );
				}
				if ( receiptItem.licensed_quantity ) {
					const quantitySummary = renderTransactionQuantitySummary( receiptItem );
					if ( quantitySummary ) {
						search_data.push( quantitySummary );
					}
				}
				return search_data;
			},
		},
	];
}

function getDatesForFiltering( receipts: Receipt[] ): Array< { value: string; label: string } > {
	const datesForFiltering = new Map< string, Date >();

	receipts.forEach( ( receipt ) => {
		const key = getDateForFiltering( receipt );
		const date = new Date( receipt.date );
		datesForFiltering.set( key, date );
	} );

	return Array.from( datesForFiltering.entries() )
		.sort( ( [ , dateA ], [ , dateB ] ) => dateB.getTime() - dateA.getTime() )
		.map( ( [ formattedDate ] ) => ( {
			value: formattedDate,
			label: formattedDate,
		} ) );
}

function getDateForFiltering( receipt: Receipt ): string {
	// Filter by year and month only.
	return new Date( receipt.date ).toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
	} );
}

function formatReceiptDate( receipt: Receipt ): string {
	return new Date( receipt.date ).toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	} );
}

function getServicesForFiltering( receipts: Receipt[] ): Array< { value: string; label: string } > {
	return [ ...new Set( receipts.map( getServiceForFiltering ) ) ].sort().map( ( service ) => ( {
		value: service,
		label: service,
	} ) );
}

function getServiceForFiltering( receipt: Receipt ): string {
	return String( receipt.service || '' );
}

function renderServiceNameDescription( receipt: Receipt ) {
	const { groupedItems: receiptItems, label } = summarizeReceiptItems( receipt.items );

	if ( receiptItems.length !== 1 ) {
		return (
			<Text isBlock weight={ 500 } size="13">
				{ label }
			</Text>
		);
	}

	const receiptItem = receiptItems[ 0 ];
	const termLabel = getTransactionTermLabel( receiptItem );
	const isAkismet =
		receiptItem.licensed_quantity && isAkismetPro500Plan( receiptItem.wpcom_product_slug );
	const displayLabel = isAkismet
		? sprintf(
				/* translators: 1: product name like "Akismet Pro", 2: number of requests per month */
				__( '%1$s (%2$d requests/month)' ),
				label.replace( /\s*\(.*$/, '' ).trim(),
				500 * parseInt( String( receiptItem.licensed_quantity ) )
		  )
		: label;

	return (
		<VStack spacing={ 1 }>
			<Text isBlock weight={ 500 } size="13">
				{ displayLabel }
			</Text>
			{ receiptItem.domain && (
				<Text isBlock variant="muted" size="12">
					{ receiptItem.domain }
				</Text>
			) }
			{ termLabel && (
				<Text isBlock variant="muted" size="12">
					{ termLabel }
				</Text>
			) }
			{ receiptItem.licensed_quantity && (
				<Text isBlock variant="muted" size="12">
					{ renderTransactionQuantitySummary( receiptItem ) }
				</Text>
			) }
		</VStack>
	);
}

function renderInlineHiddenField( key: string, label: string, value: string ) {
	return (
		<Text key={ key } isBlock variant="muted" size="12" className="billing-history-receipt-meta">
			<span className="billing-history-receipt-meta-label">{ label }</span>
			<span className="billing-history-receipt-meta-value">{ value }</span>
		</Text>
	);
}

function renderInlineHiddenFields( receipt: Receipt, visibleFields: string[] ) {
	const lines: JSX.Element[] = [];

	if ( ! visibleFields.includes( 'date' ) ) {
		lines.push( renderInlineHiddenField( 'date', __( 'Date' ), formatReceiptDate( receipt ) ) );
	}
	if ( ! visibleFields.includes( 'type' ) ) {
		lines.push(
			renderInlineHiddenField( 'type', __( 'Type' ), getReceiptItemTypeForDisplay( receipt ) )
		);
	}
	if ( ! visibleFields.includes( 'amount' ) ) {
		lines.push(
			renderInlineHiddenField( 'amount', __( 'Amount' ), formatReceiptAmount( receipt ) )
		);
	}
	return lines;
}

function getReceiptItemTypesForFiltering(
	receipts: Receipt[]
): Array< { value: string; label: string } > {
	return [ ...new Set( receipts.map( getReceiptItemTypeForDisplay ) ) ]
		.sort()
		.map( ( itemType ) => ( {
			value: itemType,
			label: itemType,
		} ) );
}

/**
 * Returns the receipt item type of a receipt for display purposes (including sorting, filtering, searching, etc).
 */
function getReceiptItemTypeForDisplay( receipt: Receipt ): string {
	const [ receiptItem ] = groupDomainProducts( receipt.items );
	return String( receiptItem.type_localized || receiptItem.type || '' );
}

function renderReceiptAmount( receipt: Receipt, taxName?: string ) {
	if ( ! transactionIncludesTax( receipt ) ) {
		return (
			<VStack spacing={ 1 }>
				<Text isBlock variant="muted" size="13">
					{ formatReceiptAmount( receipt ) }
				</Text>
			</VStack>
		);
	}

	const taxAmount = formatReceiptTaxAmount( receipt );
	const includesTaxString = taxName
		? sprintf(
				/* translators: taxAmount is a localized price like $12.34, taxName is a tax name like VAT or GST */
				__( '(includes %(taxAmount)s %(taxName)s)' ),
				{ taxAmount, taxName }
		  )
		: sprintf(
				/* translators: %s is a localized price, like $12.34 */
				__( '(includes %s tax)' ),
				taxAmount
		  );

	return (
		<VStack spacing={ 1 }>
			<Text isBlock variant="muted" size="13">
				{ formatReceiptAmount( receipt ) }
			</Text>
			<Text isBlock variant="muted" size="13">
				{ includesTaxString }
			</Text>
		</VStack>
	);
}
