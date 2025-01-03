import pageRedirect from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
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

export function useReceiptActions( getReceiptUrlFor: ( receiptId: string ) => string ) {
	const dispatch = useDispatch< ThunkDispatch< IAppState, undefined, Action > >();

	return useMemo(
		() => [
			{
				id: 'view-receipt',
				label: 'View receipt',
				isPrimary: true,
				icon: <Gridicon icon="pages" />,
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					pageRedirect.redirect( getReceiptUrlFor( item.id ) );
				},
			},
			{
				id: 'email-receipt',
				label: 'Email receipt',
				isPrimary: true,
				icon: <Gridicon icon="mail" />,
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					recordClickEvent( 'Email Receipt in Billing History' );
					dispatch( sendBillingReceiptEmail( item.id ) );
				},
			},
		],
		[ dispatch, getReceiptUrlFor ]
	);
}
