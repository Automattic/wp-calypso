import { useShoppingCart } from '@automattic/shopping-cart';
import { useEffect, useRef } from 'react';
import { getNoticeIdForMessage } from 'calypso/my-sites/checkout/cart/cart-messages';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { removeNotice } from 'calypso/state/notices/actions';

export default function CartMessageCleanup(): null {
	const cartKey = useCartKey();
	const { clearMessages, responseCart } = useShoppingCart( cartKey );
	const dispatch = useDispatch();
	const dispatchRef = useRef( dispatch );
	const noticeIds = useRef( new Set< string >() );
	const clearMessagesCallbacks = useRef( new Set< typeof clearMessages >() );

	useEffect( () => {
		dispatchRef.current = dispatch;
	}, [ dispatch ] );

	useEffect( () => {
		clearMessagesCallbacks.current.add( clearMessages );
	}, [ clearMessages ] );

	useEffect( () => {
		const errors = [
			...( responseCart.messages?.errors ?? [] ),
			...( responseCart.messages?.persistent_errors ?? [] ),
		];

		errors.forEach( ( message ) => noticeIds.current.add( getNoticeIdForMessage( message ) ) );
	}, [ responseCart.messages ] );

	useEffect( () => {
		const currentNoticeIds = noticeIds.current;
		const currentClearMessagesCallbacks = clearMessagesCallbacks.current;

		return () => {
			currentNoticeIds.forEach( ( noticeId ) => {
				dispatchRef.current( removeNotice( noticeId ) );
			} );

			currentClearMessagesCallbacks.forEach( ( clearMessagesCallback ) => {
				void clearMessagesCallback().catch( () => undefined );
			} );
		};
	}, [] );

	return null;
}
