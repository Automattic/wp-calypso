import { PLAN_EXPIRY_NOTICE_DISMISS_META_KEY } from '@automattic/api-core';
import { siteCurrentUserMetaMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { PlanExpiryNotice } from '../plan-expiry-notice';
import type { SiteExpiryNoticeState } from './use-site-expiry-notice';

export interface SiteExpiryNoticeBannerProps {
	siteId: number;
	state: SiteExpiryNoticeState;
	locale: string;
	surface: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
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
	renewReturnUrl,
	viewOtherPlansUrl,
	onContactSupport,
}: SiteExpiryNoticeBannerProps ) {
	const { purchase, stage, isDismissible, isReverted } = state;
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { mutate: updateMeta } = useMutation( siteCurrentUserMetaMutation( siteId ) );

	const eventProperties = {
		surface,
		purchase_id: purchase.ID,
		product_slug: purchase.product_slug,
		stage,
	};

	const dismiss = () => {
		setIsDismissed( true );
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_dismiss', eventProperties );
		updateMeta(
			{ [ PLAN_EXPIRY_NOTICE_DISMISS_META_KEY ]: 1 },
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
			locale={ locale }
			surface={ surface }
			recordTracksEvent={ recordTracksEvent }
			renewReturnUrl={ renewReturnUrl }
			viewOtherPlansUrl={ viewOtherPlansUrl }
			onContactSupport={ onContactSupport }
			onClose={ isDismissible ? dismiss : undefined }
		/>
	);
}
