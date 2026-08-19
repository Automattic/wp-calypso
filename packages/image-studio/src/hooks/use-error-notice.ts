import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { openImageStudioUpgradeUrl } from '../utils/open-upgrade-url';
import { parseErrorUrl } from '../utils/parse-error-url';
import {
	trackImageStudioUpgradeNoticeClick,
	trackImageStudioUpgradeNoticeShown,
} from '../utils/tracking';
import type { NoticeAction, NoticeType } from '../store';
import type { ImageStudioMode } from '../types';
import type { NoticeConfig } from '@automattic/agenttic-ui';

type AddNoticeFunc = ( content: string, type: NoticeType, actions?: NoticeAction[] ) => void;
type ImageStudioChatNotice = NoticeConfig & { suppressCurrentError?: boolean };

export interface UseErrorNoticeOptions {
	placement?: 'modal' | 'chat';
}

/**
 * Hook that displays an error notice when an error occurs.
 * Extracts URLs from error messages and shows appropriate action buttons.
 * Upgrade URLs can render in the chat composer while other errors remain in
 * the modal notice store.
 * @param error             - The error to display
 * @param addNotice         - Function to add a notice to the store
 * @param mode              - Image Studio mode ('edit' or 'generate') for tracking
 * @param options           - Notice placement options
 * @param options.placement - Where upgrade notices should render
 */
export function useErrorNotice(
	error: unknown,
	addNotice: AddNoticeFunc,
	mode: ImageStudioMode,
	{ placement = 'modal' }: UseErrorNoticeOptions = {}
): NoticeConfig | undefined {
	// The notice store dedupes by content, so repeated errors with the same
	// message keep a single visible notice; mirror that here and count one
	// impression per distinct message rather than one per error.
	const trackedImpressions = useRef< Set< string > >( new Set() );
	// Agenttic clears request errors after settlement, but quota exhaustion persists.
	const [ chatNotice, setChatNotice ] = useState< ImageStudioChatNotice >();
	const errorDetails = useMemo( () => {
		if ( ! error ) {
			return undefined;
		}

		const errorMessage =
			( error as Error )?.message ||
			String( error ) ||
			__( 'An error occurred while generating content.', __i18n_text_domain__ );

		return parseErrorUrl( errorMessage );
	}, [ error ] );
	const currentChatNotice = useMemo< ImageStudioChatNotice | undefined >( () => {
		if ( placement !== 'chat' || ! errorDetails?.url || ! errorDetails.isUpgradeUrl ) {
			return undefined;
		}
		const upgradeUrl = errorDetails.url;

		return {
			message: __( 'You’re out of free credits.', __i18n_text_domain__ ),
			status: 'error',
			dismissible: false,
			suppressCurrentError: true,
			action: {
				label: __( 'Upgrade', __i18n_text_domain__ ),
				onClick: () => openImageStudioUpgradeUrl( upgradeUrl, mode ),
			},
		};
	}, [ errorDetails, mode, placement ] );
	const retainedChatNotice = useMemo< ImageStudioChatNotice | undefined >(
		() => ( chatNotice ? { ...chatNotice, suppressCurrentError: false } : undefined ),
		[ chatNotice ]
	);

	useEffect( () => {
		if ( ! errorDetails ) {
			return;
		}

		const { content, url, isUpgradeUrl, isPlansPageUrl } = errorDetails;

		if ( url && isUpgradeUrl ) {
			if ( ! trackedImpressions.current.has( content ) ) {
				trackedImpressions.current.add( content );
				trackImageStudioUpgradeNoticeShown( { mode } );
			}

			if ( placement === 'chat' ) {
				setChatNotice( currentChatNotice );
				return;
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
	}, [ addNotice, currentChatNotice, errorDetails, mode, placement ] );

	return placement === 'chat' ? currentChatNotice ?? retainedChatNotice : undefined;
}
