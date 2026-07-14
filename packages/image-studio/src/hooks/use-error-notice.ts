import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parseErrorUrl } from '../utils/parse-error-url';
import {
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
} from '../utils/tracking';
import type { NoticeAction, NoticeType } from '../store';
import type { ImageStudioMode } from '../types';

type AddNoticeFunc = ( content: string, type: NoticeType, actions?: NoticeAction[] ) => void;

/**
 * Hook that displays an error notice when an error occurs.
 * Extracts URLs from error messages and shows appropriate action buttons.
 * Upgrade URLs show as persistent warning notices, other errors as snackbars.
 * @param error     - The error to display
 * @param addNotice - Function to add a notice to the store
 * @param mode      - Image Studio mode ('edit' or 'generate') for tracking
 */
export function useErrorNotice(
	error: unknown,
	addNotice: AddNoticeFunc,
	mode: ImageStudioMode
): void {
	// The notice store dedupes by content, so repeated errors with the same
	// message keep a single visible notice; mirror that here and count one
	// impression per distinct message rather than one per error.
	const trackedImpressions = useRef< Set< string > >( new Set() );
	useEffect( () => {
		if ( ! error ) {
			return;
		}

		const errorMessage =
			( error as Error )?.message ||
			String( error ) ||
			__( 'An error occurred while generating content.', __i18n_text_domain__ );

		const { content, url, isUpgradeUrl, isPlansPageUrl } = parseErrorUrl( errorMessage );

		if ( url && isUpgradeUrl ) {
			// Show upgrade notices as persistent warning notices
			if ( ! trackedImpressions.current.has( content ) ) {
				trackedImpressions.current.add( content );
				trackImageStudioUpgradeNoticeShown( { mode } );
			}
			addNotice( content, 'warning', [
				{
					label: isPlansPageUrl
						? __( 'See plans', __i18n_text_domain__ )
						: __( 'Upgrade plan', __i18n_text_domain__ ),
					url,
					openInNewTab: true,
					onClick: () => trackImageStudioUpgradeNoticeClick( { mode } ),
				},
			] );
		} else if ( url ) {
			// Non-upgrade URLs show as error snackbar with Learn more link
			addNotice( content, 'error', [
				{
					label: __( 'Learn more', __i18n_text_domain__ ),
					url,
					openInNewTab: true,
				},
			] );
		} else {
			// Plain errors show as snackbar
			addNotice( content, 'error' );
		}
	}, [ error, addNotice, mode ] );
}
