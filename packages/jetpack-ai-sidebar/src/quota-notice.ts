import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trackJetpackAiUpgrade } from './utils/tracking';

const QUOTA_EXHAUSTED_CODE_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?jetpack_ai_quota_exhausted(?:[.!:\s]|$)/i;
const QUOTA_EXHAUSTED_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?(?:you have reached your jetpack ai usage limit|jetpack ai usage limit reached)(?:[.!:\s]|$)/i;
const TRUSTED_UPGRADE_HOSTS = [ 'wordpress.com', 'jetpack.com' ];

export interface JetpackAiChatNotice {
	message: string;
	status?: 'success' | 'warning' | 'error';
	action?: { label: string; onClick: () => void };
	dismissible?: boolean;
	/** The persistent notice replaces this specific backend rejection. */
	suppressCurrentError?: boolean;
}

function getTrustedUpgradeUrl( value: string ): string | null {
	try {
		const url = new URL( value.replace( /[.,;:!?)\]}]+$/, '' ) );
		return url.protocol === 'https:' && TRUSTED_UPGRADE_HOSTS.includes( url.hostname )
			? url.href
			: null;
	} catch {
		return null;
	}
}

function findUpgradeUrlInMessage( message: string ): string | null {
	for ( const [ candidate ] of message.matchAll( /https:\/\/[^\s<>"']+/g ) ) {
		const url = getTrustedUpgradeUrl( candidate );
		if ( url ) {
			return url;
		}
	}

	return null;
}

function isQuotaExhaustedError( error: string | null ): error is string {
	return (
		error !== null &&
		( QUOTA_EXHAUSTED_CODE_MESSAGE.test( error ) || QUOTA_EXHAUSTED_MESSAGE.test( error ) )
	);
}

interface ExhaustedState {
	upgradeUrl: string | null;
}

/**
 * Show a persistent notice after the backend rejects an exhausted request.
 * The backend remains the only admission authority and every later submit is
 * still sent for a fresh quota check.
 * @param props       - Hook props.
 * @param props.error - Agenttic's current error string.
 */
export function useChatNotice( {
	error,
}: {
	error: string | null;
} ): JetpackAiChatNotice | undefined {
	const [ exhausted, setExhausted ] = useState< ExhaustedState | null >( null );
	const currentErrorIsQuotaExhaustion = isQuotaExhaustedError( error );
	const rejectionUpgradeUrl = currentErrorIsQuotaExhaustion
		? findUpgradeUrlInMessage( error )
		: null;

	useEffect( () => {
		if ( ! currentErrorIsQuotaExhaustion ) {
			return;
		}

		setExhausted( ( current ) => ( {
			upgradeUrl: rejectionUpgradeUrl ?? current?.upgradeUrl ?? null,
		} ) );
	}, [ currentErrorIsQuotaExhaustion, rejectionUpgradeUrl ] );

	const upgradeUrl = rejectionUpgradeUrl ?? exhausted?.upgradeUrl ?? null;
	const onUpgradeClick = useCallback( () => {
		if ( ! upgradeUrl ) {
			return;
		}

		try {
			trackJetpackAiUpgrade();
		} catch {
			// Analytics must never block checkout navigation.
		}
		window.location.assign( upgradeUrl );
	}, [ upgradeUrl ] );

	return useMemo( () => {
		if ( ! currentErrorIsQuotaExhaustion && ! exhausted ) {
			return undefined;
		}

		return {
			message: __( 'You’ve reached your Jetpack AI usage limit.', __i18n_text_domain__ ),
			status: 'error' as const,
			dismissible: false,
			suppressCurrentError: currentErrorIsQuotaExhaustion,
			action: upgradeUrl
				? { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgradeClick }
				: undefined,
		};
	}, [ currentErrorIsQuotaExhaustion, exhausted, onUpgradeClick, upgradeUrl ] );
}
