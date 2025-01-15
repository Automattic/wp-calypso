import { useTranslate } from 'i18n-calypso';
import { createElement, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import type { Action, ActionModal } from '@wordpress/dataviews';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';
import type { IAppState } from 'calypso/state/types';
import type { Action as ReduxAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

function recordClickEvent( eventAction: string ): void {
	recordGoogleEvent( 'Me', eventAction );
}

export type ReceiptAction = ( Action< BillingTransaction > | ActionModal< BillingTransaction > ) & {
	iconName: string;
};

type AppDispatch = ThunkDispatch< IAppState, undefined, ReduxAction >;

function handleEmailReceipt( items: BillingTransaction[], dispatch: AppDispatch ): void {
	if ( ! items?.length || ! items[ 0 ]?.id ) {
		return;
	}
	recordClickEvent( 'Email Receipt in Billing History' );
	dispatch( sendBillingReceiptEmail( items[ 0 ].id ) );
}

export function useReceiptActions(
	getReceiptUrlFor?: ( receiptId: string ) => string
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
				modalHeader: translate( 'View receipt' ),
				modalProps: {
					size: 'large',
				},
				RenderModal: ( props ) => {
					const ReceiptModal = require( '../receipt-modal' ).default;
					const [ item ] = props.items;
					return createElement( ReceiptModal, { item, closeModal: props.closeModal } );
				},
			},
			{
				id: 'email-receipt',
				label: translate( 'Email receipt' ),
				isPrimary: true,
				iconName: 'mail',
				callback: ( items: BillingTransaction[] ) => handleEmailReceipt( items, dispatch ),
			},
		],
		[ dispatch, translate ]
	);
}
