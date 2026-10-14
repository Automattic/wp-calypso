import { siteCurrentUserMetaMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Hides the notice at once and stamps the dismissal through the meta key
 * wp-admin's banner shares, bringing the notice back if the write fails.
 * `dismiss` is undefined without a key, so no close button is offered.
 */
export function useExpiryNoticeDismissal(
	siteId: number,
	dismissMetaKey: string | undefined,
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void
) {
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { mutate: updateMeta } = useMutation( siteCurrentUserMetaMutation( siteId ) );

	const dismiss = ( eventProperties: Record< string, unknown > ) => {
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

	return { isDismissed, dismiss: dismissMetaKey ? dismiss : undefined };
}
