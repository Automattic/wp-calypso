import pageRedirect from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';
import type { IAppState } from 'calypso/state/types';
import type { Action } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

function recordClickEvent( eventAction: string ): void {
	recordGoogleEvent( 'Me', eventAction );
}

export type ReceiptAction = {
	id: 'view-receipt' | 'email-receipt';
	label: string;
	isPrimary: boolean;
	iconName: string;
	callback: ( items: BillingTransaction[] ) => void;
};

type AppDispatch = ThunkDispatch< IAppState, undefined, Action >;

function handleViewReceipt(
	items: BillingTransaction[],
	getReceiptUrlFor: ( receiptId: string ) => string
): void {
	if ( ! items?.length || ! items[ 0 ]?.id ) {
		return;
	}
	pageRedirect.redirect( getReceiptUrlFor( items[ 0 ].id ) );
}

function handleEmailReceipt( items: BillingTransaction[], dispatch: AppDispatch ): void {
	if ( ! items?.length || ! items[ 0 ]?.id ) {
		return;
	}
	recordClickEvent( 'Email Receipt in Billing History' );
	dispatch( sendBillingReceiptEmail( items[ 0 ].id ) );
}

export function useReceiptActions(
	getReceiptUrlFor: ( receiptId: string ) => string
): ReceiptAction[] {
	const dispatch = useDispatch< AppDispatch >();
	const translate = useTranslate();

	return useMemo(
		() => [
			{
				id: 'view-receipt',
				label: translate( 'View receipt' ),
				isPrimary: true,
				iconName: 'pages',
				callback: ( items: BillingTransaction[] ) => handleViewReceipt( items, getReceiptUrlFor ),
			},
			{
				id: 'email-receipt',
				label: translate( 'Email receipt' ),
				isPrimary: true,
				iconName: 'mail',
				callback: ( items: BillingTransaction[] ) => handleEmailReceipt( items, dispatch ),
			},
		],
		[ dispatch, getReceiptUrlFor, translate ]
	);
}
