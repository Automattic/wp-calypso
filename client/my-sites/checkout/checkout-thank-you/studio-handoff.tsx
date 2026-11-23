import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getQueryArgs } from 'calypso/lib/query-args';
import { openStudioCheckoutReturn } from '../studio-return/deep-link';
import { getStudioCheckoutParams } from '../studio-return/round-trip';
import type { FunctionComponent } from 'react';

interface StudioHandoffProps {
	siteId?: number;
	receiptId?: number;
	// Hand off without the notice, on a page that offers its own "Open Studio" button.
	hideNotice?: boolean;
}

/**
 * The Studio round-trip params on this thank-you URL, and the one way to hand the buyer back to
 * Studio with them, so every "Open Studio" records the same `calypso_studio_checkout_return`.
 */
export function useStudioCheckoutReturn( {
	siteId,
	receiptId,
}: {
	siteId?: number;
	receiptId?: number;
} ) {
	// The query string does not change while this page is mounted.
	const studioCheckoutParams = useMemo( () => getStudioCheckoutParams( getQueryArgs() ), [] );

	const openStudio = useCallback(
		( { fromUserClick }: { fromUserClick: boolean } ) => {
			if ( ! studioCheckoutParams ) {
				return;
			}
			recordTracksEvent( 'calypso_studio_checkout_return', {
				checkout_result: 'success',
				click: fromUserClick,
				studio_site_id: studioCheckoutParams.studioSiteId,
				studio_return_to: studioCheckoutParams.studioReturnTo,
				blog_id: siteId,
				receipt_id: receiptId,
			} );
			openStudioCheckoutReturn( {
				...studioCheckoutParams,
				checkoutResult: 'success',
			} );
		},
		[ studioCheckoutParams, siteId, receiptId ]
	);

	return { studioCheckoutParams, openStudio };
}

/**
 * Hands the user back to the Studio app after a purchase they started there.
 *
 * Renders nothing at all unless the thank-you URL carries valid Studio params, so ordinary
 * checkouts are unaffected.
 *
 * The surrounding page waits for the receipt to load, so the handoff fires after that rather than
 * on first paint.
 */
const StudioHandoff: FunctionComponent< StudioHandoffProps > = ( {
	siteId,
	receiptId,
	hideNotice,
} ) => {
	const translate = useTranslate();
	const { studioCheckoutParams, openStudio } = useStudioCheckoutReturn( { siteId, receiptId } );

	const hasAttemptedHandoff = useRef( false );
	useEffect( () => {
		if ( ! studioCheckoutParams || hasAttemptedHandoff.current ) {
			return;
		}
		hasAttemptedHandoff.current = true;
		openStudio( { fromUserClick: false } );
	}, [ studioCheckoutParams, openStudio ] );

	if ( ! studioCheckoutParams || hideNotice ) {
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
