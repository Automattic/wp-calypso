import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { getQueryArgs } from 'calypso/lib/query-args';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { openStudioCheckoutReturn } from '../studio-return/deep-link';
import { getStudioCheckoutParams } from '../studio-return/round-trip';
import type { FunctionComponent } from 'react';

interface StudioHandoffProps {
	siteId?: number;
	receiptId?: number;
}

/**
 * Hands the user back to the Studio app after a purchase they started there.
 *
 * Renders nothing at all unless the thank-you URL carries a valid `studioSiteId`, so ordinary
 * checkouts are unaffected.
 *
 * The surrounding page waits for the receipt to load, so the handoff fires after that rather than
 * on first paint.
 */
const StudioHandoff: FunctionComponent< StudioHandoffProps > = ( { siteId, receiptId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// The query string does not change while this page is mounted.
	const studioCheckoutParams = useMemo( () => getStudioCheckoutParams( getQueryArgs() ), [] );

	const openStudio = useCallback(
		( { fromUserClick }: { fromUserClick: boolean } ) => {
			if ( ! studioCheckoutParams ) {
				return;
			}
			dispatch(
				recordTracksEvent( 'calypso_studio_checkout_return', {
					checkout_result: 'success',
					click: fromUserClick,
					studio_site_id: studioCheckoutParams.studioSiteId,
					studio_return_to: studioCheckoutParams.studioReturnTo,
					blog_id: siteId,
					receipt_id: receiptId,
				} )
			);
			openStudioCheckoutReturn( {
				...studioCheckoutParams,
				checkoutResult: 'success',
			} );
		},
		[ dispatch, studioCheckoutParams, siteId, receiptId ]
	);

	const hasAttemptedHandoff = useRef( false );
	useEffect( () => {
		if ( ! studioCheckoutParams || hasAttemptedHandoff.current ) {
			return;
		}
		hasAttemptedHandoff.current = true;
		openStudio( { fromUserClick: false } );
	}, [ studioCheckoutParams, openStudio ] );

	if ( ! studioCheckoutParams ) {
		return null;
	}

	return (
		// `text` rather than children: with children alone the action would render inside the text
		// span instead of its own slot.
		<Notice
			className="checkout-thank-you__studio-handoff"
			text={ translate( 'Your purchase is ready in WordPress Studio.' ) }
			showDismiss={ false }
			status="is-info"
		>
			<NoticeAction onClick={ () => openStudio( { fromUserClick: true } ) } external>
				{ translate( 'Open Studio' ) }
			</NoticeAction>
		</Notice>
	);
};

export default StudioHandoff;
