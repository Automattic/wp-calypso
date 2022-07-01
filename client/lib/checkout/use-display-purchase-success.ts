import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { successNotice } from 'calypso/state/notices/actions';

export function useDisplayPurchaseSuccess( areNoticesAllowed = true ): void {
	const queryString = new URLSearchParams( window?.location?.search );
	const noticeType = queryString.get( 'notice' ) ?? undefined;
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
	}, [ shouldShowNotice, translate, reduxDispatch, noticeType ] );
}
