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

const recordClickEvent = ( eventAction: string ) => {
	recordGoogleEvent( 'Me', eventAction );
};

export type ReceiptAction = {
	id: 'view-receipt' | 'email-receipt';
	label: string;
	isPrimary: boolean;
	iconName: string;
	callback: ( items: BillingTransaction[] ) => void;
};

export function useReceiptActions(
	getReceiptUrlFor: ( receiptId: string ) => string
): ReceiptAction[] {
	const dispatch = useDispatch< ThunkDispatch< IAppState, undefined, Action > >();
	const translate = useTranslate();

	return useMemo(
		() => [
			{
				id: 'view-receipt',
				label: translate( 'View receipt' ),
				isPrimary: true,
				iconName: 'pages',
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					pageRedirect.redirect( getReceiptUrlFor( item.id ) );
				},
			},
			{
				id: 'email-receipt',
				label: translate( 'Email receipt' ),
				isPrimary: true,
				iconName: 'mail',
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					recordClickEvent( 'Email Receipt in Billing History' );
					dispatch( sendBillingReceiptEmail( item.id ) );
				},
			},
		],
		[ dispatch, getReceiptUrlFor, translate ]
	);
}
