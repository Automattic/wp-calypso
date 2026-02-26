import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parseErrorUrl } from '../utils/parse-error-url';
import type { NoticeAction } from '../store';

type AddNoticeFunc = (
	content: string,
	type: 'error' | 'success',
	actions?: NoticeAction[]
) => void;

/**
 * Hook that displays an error notice when an error occurs.
 * Extracts URLs from error messages and shows appropriate action buttons.
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

		const { content, url, isUpgradeUrl } = parseErrorUrl( errorMessage );

		if ( url ) {
			addNotice( content, 'error', [
				{
					label: isUpgradeUrl
						? __( 'Upgrade', __i18n_text_domain__ )
						: __( 'Learn more', __i18n_text_domain__ ),
					url,
					openInNewTab: true,
				},
			] );
		} else {
			addNotice( content, 'error' );
		}
	}, [ error, addNotice ] );
}
