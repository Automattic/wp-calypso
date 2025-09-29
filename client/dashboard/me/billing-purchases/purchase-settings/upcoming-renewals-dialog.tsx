import { formatCurrency } from '@automattic/number-formatters';
import { Link } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { getRelativeTimeString } from '../../../utils/datetime';
import { getSubtitleForDisplay, isExpired, isRenewing } from '../../../utils/purchase';
import { getPurchaseUrlForId } from '../urls';
import type { Purchase } from '@automattic/api-core';
import type { Field, View, Action } from '@wordpress/dataviews';

interface Props {
	siteDomain: string;
	purchases: Purchase[];
	onClose: () => void;
	onConfirm: ( purchases: Purchase[] ) => void;
	submitButtonText?: string;
	hideManagePurchaseLinks?: boolean;
}

function ExpiresText( { purchase }: { purchase: Purchase } ) {
	if ( isRenewing( purchase ) ) {
		// translators: "renewDate" is relative to the present time and it is already localized, eg. "in a year", "in a month"
		return sprintf( __( 'renews %(renewDate)s' ), {
			renewDate: getRelativeTimeString( new Date( purchase.renew_date ) ),
		} );
	}
	if ( isExpired( purchase ) ) {
		// translators: "expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"
		return sprintf( __( 'expired %(expiry)s' ), {
			expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		} );
	}
	// translators: "expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"
	return sprintf( __( 'expires %(expiry)s' ), {
		expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
	} );
}

function getPurchaseFields( {
	hideManagePurchaseLinks,
	onClose,
}: {
	hideManagePurchaseLinks?: boolean;
	onClose: () => void;
} ): Field< Purchase >[] {
	const fields: Field< Purchase >[] = [
		{
			id: 'product_name',
			type: 'text',
			label: __( 'Product' ),
			getValue: ( { item } ) => ( item.is_domain ? item.meta ?? '' : item.product_name ),
			render: ( { item } ) => {
				const purchaseTypeText = getSubtitleForDisplay( item );
				return (
					<VStack spacing={ 1 }>
						<Text>{ item.is_domain ? item.meta ?? '' : item.product_name }</Text>
						<Text variant="muted">
							{ purchaseTypeText ? `${ purchaseTypeText }: ` : '' }
							<span>{ purchaseTypeText && <ExpiresText purchase={ item } /> }</span>
						</Text>
					</VStack>
				);
			},
		},
		{
			id: 'amount',
			type: 'text',
			label: __( 'Price' ),
			getValue: ( { item } ) =>
				formatCurrency( item.sale_amount ?? item.amount, item.currency_code, { stripZeros: true } ),
			render: ( { item } ) => (
				<Text>
					{ formatCurrency( item.sale_amount ?? item.amount, item.currency_code, {
						stripZeros: true,
					} ) }
				</Text>
			),
		},
	];

	if ( ! hideManagePurchaseLinks ) {
		fields.push( {
			id: 'manage',
			type: 'text',
			label: __( 'Actions' ),
			getValue: () => '',
			render: ( { item } ) => (
				<Link to={ getPurchaseUrlForId( item.ID ) } onClick={ onClose }>
					{ __( 'Manage purchase' ) }
				</Link>
			),
		} );
	}

	return fields;
}

export function UpcomingRenewalsDialog( {
	siteDomain,
	purchases,
	onClose,
	onConfirm,
	submitButtonText,
	hideManagePurchaseLinks,
}: Props ) {
	const purchasesSortByRecentExpiryDate = useMemo(
		() =>
			[ ...purchases ].sort( ( a, b ) => {
				const compareDateA = isRenewing( a ) ? a.renew_date : a.expiry_date;
				const compareDateB = isRenewing( b ) ? b.renew_date : b.expiry_date;
				return compareDateA?.localeCompare?.( compareDateB );
			} ),
		[ purchases ]
	);

	const [ view, setView ] = useState< View >( {
		type: 'table',
		perPage: 100,
		page: 1,
		fields: hideManagePurchaseLinks
			? [ 'product_name', 'amount' ]
			: [ 'product_name', 'amount', 'manage' ],
		layout: {},
	} );

	const [ selection, setSelection ] = useState< string[] >(
		purchases.map( ( purchase ) => purchase.ID.toString() )
	);

	useEffect( () => {
		setSelection( purchases.map( ( purchase ) => purchase.ID.toString() ) );
	}, [ purchases ] );

	const fields = useMemo(
		() => getPurchaseFields( { hideManagePurchaseLinks, onClose } ),
		[ hideManagePurchaseLinks, onClose ]
	);

	const dataWithIds = useMemo(
		() =>
			purchasesSortByRecentExpiryDate.map( ( purchase ) => ( {
				...purchase,
				id: purchase.ID.toString(),
			} ) ),
		[ purchasesSortByRecentExpiryDate ]
	);

	const actions = useMemo(
		(): Action< Purchase & { id: string } >[] => [
			{
				id: 'select-for-renewal',
				label: __( 'Select for renewal' ),
				supportsBulk: true,
				icon: () => null,
				callback: () => {
					// This action exists just to enable bulk selection checkboxes
					// The actual renewal logic is handled by the dialog's confirm button
				},
			},
		],
		[]
	);

	const handleConfirm = () => {
		const selectedPurchaseIds = selection.map( Number );
		const selectedPurchasesData = purchases.filter( ( purchase ) =>
			selectedPurchaseIds.includes( purchase.ID )
		);
		onConfirm( selectedPurchasesData );
	};

	return (
		<ConfirmDialog
			size="large"
			confirmButtonText={ submitButtonText ?? __( 'Renew now' ) }
			onConfirm={ handleConfirm }
			onCancel={ onClose }
		>
			<VStack>
				<Heading>{ __( 'Upcoming renewals' ) }</Heading>
				<Text variant="muted">
					{
						// translators: siteName is the URL of the site
						sprintf( __( 'Site: %(siteName)s' ), { siteName: siteDomain } )
					}
				</Text>
			</VStack>
			<Divider margin={ 3 } />
			<DataViews
				data={ dataWithIds }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ setSelection }
				actions={ actions }
				getItemId={ ( item ) => item.id }
				isLoading={ false }
				paginationInfo={ {
					totalItems: dataWithIds.length,
					totalPages: 1,
				} }
				defaultLayouts={ { table: {} } }
			/>
		</ConfirmDialog>
	);
}
