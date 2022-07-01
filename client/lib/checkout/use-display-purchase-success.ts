import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { successNotice } from 'calypso/state/notices/actions';

export function useDisplayPurchaseSuccess( areNoticesAllowed = true ): void {
	const queryParams = new URLSearchParams( window?.location?.search );
	const noticeType = queryParams.get( 'notice' ) ?? undefined;
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const shouldShowNotice = Boolean( areNoticesAllowed && noticeType === 'purchase-success' );
	const lastShownNotice = useRef< string | undefined >();

	useEffect( () => {
		if ( ! shouldShowNotice || lastShownNotice.current === noticeType ) {
			return;
		}

		lastShownNotice.current = noticeType;
		const successMessage = translate( 'Your purchase has been completed!' );
		reduxDispatch( successNotice( successMessage ) );

		// Remove the notice query string from the URL after displaying the message
		// so that it will not be included in bookmarks or browser history.
		const currentUrl = new URL( window?.location?.href ?? 'https://wordpress.com' );
		currentUrl.searchParams.delete( 'notice' );
		window?.history?.replaceState?.( null, '', currentUrl );
	}, [ shouldShowNotice, translate, reduxDispatch, noticeType ] );
}
