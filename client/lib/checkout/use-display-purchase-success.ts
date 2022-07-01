import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { successNotice } from 'calypso/state/notices/actions';

export function useDisplayPurchaseSuccess( noticeType: string | undefined ): void {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const shouldShowNotice = Boolean( noticeType );
	const lastShownNotice = useRef< string | undefined >();

	useEffect( () => {
		if ( ! shouldShowNotice || lastShownNotice.current === noticeType ) {
			return;
		}

		if ( noticeType === 'purchase-success' ) {
			lastShownNotice.current = noticeType;
			const successMessage = translate( 'Your purchase has been completed!' );
			reduxDispatch( successNotice( successMessage ) );
		}
	}, [ shouldShowNotice, translate, reduxDispatch, noticeType ] );
}
