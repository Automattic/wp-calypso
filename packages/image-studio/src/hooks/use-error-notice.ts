import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parseErrorUrl } from '../utils/parse-error-url';
import type { NoticeAction, NoticeType } from '../store';

type AddNoticeFunc = ( content: string, type: NoticeType, actions?: NoticeAction[] ) => void;

/**
 * Hook that displays an error notice when an error occurs.
 * Extracts URLs from error messages and shows appropriate action buttons.
 * Upgrade URLs show as persistent warning notices, other errors as snackbars.
 * @param error     - The error to display
 * @param addNotice - Function to add a notice to the store
 */
export function useErrorNotice( error: unknown, addNotice: AddNoticeFunc ): void {
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
			addNotice( content, 'warning', [
				{
					label: isPlansPageUrl
						? __( 'See plans', __i18n_text_domain__ )
						: __( 'Upgrade plan', __i18n_text_domain__ ),
					url,
					openInNewTab: true,
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
	}, [ error, addNotice ] );
}
