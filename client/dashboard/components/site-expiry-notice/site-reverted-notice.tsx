import { siteCurrentUserMetaMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { getCalendarDaysUntil } from '../../utils/datetime';
import Notice from '../notice';
import { getExpiryStateName, getSiteRevertedNotice } from '../plan-expiry-notice';
import type { PlanExpiryEventStage } from '../plan-expiry-notice';
import type { SiteExpiryRevertedState } from './use-site-expiry-notice';

export interface SiteRevertedNoticeProps {
	siteId: number;
	state: SiteExpiryRevertedState;
	surface: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	/** Extra properties for every event this notice records. */
	eventProperties?: Record< string, unknown >;
	/** Opens the host's Help Center with a prefilled message. Without it the action is not offered. */
	onContactSupport?: ( message: string ) => void;
}

/**
 * The post-grace notice for a site reverted after its plan expired. There is
 * no purchase left to name, so the copy is generic and support is the only
 * way back. Dismissible through the meta key wp-admin's banner shares.
 */
export function SiteRevertedNotice( {
	siteId,
	state,
	surface,
	recordTracksEvent,
	eventProperties: extraEventProperties,
	onContactSupport,
}: SiteRevertedNoticeProps ) {
	const { revertedAt, dismissMetaKey } = state;
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { mutate: updateMeta } = useMutation( siteCurrentUserMetaMutation( siteId ) );
	const notice = getSiteRevertedNotice();

	const daysRemaining = getCalendarDaysUntil( new Date( revertedAt ) );
	const extraEventPropertiesKey = JSON.stringify( extraEventProperties ?? {} );
	const stage: PlanExpiryEventStage = 'post-grace';
	const eventProperties = useMemo(
		() => ( {
			...extraEventProperties,
			surface,
			stage,
			state: getExpiryStateName( stage ),
			days_remaining: daysRemaining,
		} ),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- extraEventPropertiesKey stands in for extraEventProperties.
		[ surface, daysRemaining, extraEventPropertiesKey ]
	);

	useEffect( () => {
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_impression', eventProperties );
	}, [ recordTracksEvent, eventProperties ] );

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

	const contactSupport = () => {
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_click', {
			...eventProperties,
			action: 'contact-support',
			cta: 'support',
		} );
		onContactSupport?.( notice.supportMessage );
	};

	if ( isDismissed ) {
		return null;
	}

	return (
		<Notice
			variant="error"
			title={ notice.title }
			onClose={ dismissMetaKey ? dismiss : undefined }
			actions={
				onContactSupport && (
					<Button variant="primary" onClick={ contactSupport }>
						{ __( 'Contact support' ) }
					</Button>
				)
			}
		>
			{ notice.body }
		</Notice>
	);
}
