import { siteCurrentUserMetaMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { PlanExpiryNotice, getPlanExpiryEventProperties } from '../plan-expiry-notice';
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
 * The sitewide plan-expiry banner, given a state that `useSiteExpiryNotice`
 * has already decided should show. Never decides visibility itself; the one
 * time it renders nothing is after the reader has just dismissed it, which is
 * the dashboard arbiter's sanctioned in-session dismissal.
 */
export function SiteExpiryNoticeBanner( {
	siteId,
	state,
	locale,
	surface,
	recordTracksEvent,
	eventProperties: extraEventProperties,
	renewReturnUrl,
	viewOtherPlansUrl,
	onContactSupport,
}: SiteExpiryNoticeBannerProps ) {
	const { purchase, stage, isDismissible, isReverted, isPlanOwner, dismissMetaKey } = state;
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { mutate: updateMeta } = useMutation( siteCurrentUserMetaMutation( siteId ) );

	const eventProperties = getPlanExpiryEventProperties( purchase, {
		surface,
		stage,
		isPlanOwner,
		extra: extraEventProperties,
	} );

	const dismiss = () => {
		if ( ! dismissMetaKey ) {
			return;
		}
		setIsDismissed( true );
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_dismiss', eventProperties );
		updateMeta(
			{ [ dismissMetaKey ]: 1 },
			{
				onError: ( error ) => {
					setIsDismissed( false );
					recordTracksEvent( 'calypso_purchases_plan_expiry_notice_dismiss_failed', {
						...eventProperties,
						error_message: error instanceof Error ? error.message : String( error ),
					} );
				},
			}
		);
	};

	if ( isDismissed ) {
		return null;
	}

	return (
		<PlanExpiryNotice
			purchase={ purchase }
			scope="sitewide"
			isReverted={ isReverted }
			isPlanOwner={ isPlanOwner }
			stage={ stage }
			locale={ locale }
			surface={ surface }
			recordTracksEvent={ recordTracksEvent }
			eventProperties={ extraEventProperties }
			renewReturnUrl={ renewReturnUrl }
			viewOtherPlansUrl={ viewOtherPlansUrl }
			onContactSupport={ onContactSupport }
			onClose={ isDismissible && dismissMetaKey ? dismiss : undefined }
		/>
	);
}
