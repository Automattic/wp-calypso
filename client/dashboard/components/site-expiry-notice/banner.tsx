import { PlanExpiryNotice } from '../plan-expiry-notice';
import { SiteRevertedNotice } from './site-reverted-notice';
import type { SiteExpiryNoticeState } from './use-site-expiry-notice';

export interface SiteExpiryNoticeBannerProps {
	siteId: number;
	state: SiteExpiryNoticeState;
	locale: string;
	surface: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	eventProperties?: Record< string, unknown >;
	renewReturnUrl?: string;
	viewOtherPlansUrl?: string;
	onContactSupport?: ( message: string ) => void;
}

/**
 * The sitewide plan-expiry banner. Never decides visibility itself; the one time
 * it renders nothing is the arbiter's sanctioned in-session dismissal.
 */
export function SiteExpiryNoticeBanner( {
	siteId,
	state,
	locale,
	surface,
	recordTracksEvent,
	eventProperties,
	renewReturnUrl,
	viewOtherPlansUrl,
	onContactSupport,
}: SiteExpiryNoticeBannerProps ) {
	if ( state.kind === 'reverted' ) {
		return (
			<SiteRevertedNotice
				siteId={ siteId }
				state={ state }
				surface={ surface }
				recordTracksEvent={ recordTracksEvent }
				eventProperties={ eventProperties }
				onContactSupport={ onContactSupport }
			/>
		);
	}

	return (
		<PlanExpiryNotice
			purchase={ state.purchase }
			scope="sitewide"
			isPlanOwner={ state.isPlanOwner }
			locale={ locale }
			surface={ surface }
			recordTracksEvent={ recordTracksEvent }
			eventProperties={ eventProperties }
			renewReturnUrl={ renewReturnUrl }
			viewOtherPlansUrl={ viewOtherPlansUrl }
		/>
	);
}
