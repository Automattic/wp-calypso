import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const QUOTA_EXHAUSTED_CODE_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?(?:jetpack_ai_quota_exhausted|ai_credit_allowance_exhausted)(?:[.!:\s]|$)/i;
const QUOTA_EXHAUSTED_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?(?:you have reached your jetpack ai usage limit|jetpack ai usage limit reached|you have used all ai credits included with this site for this month)(?:[.!:\s]|$)/i;

export interface JetpackAiChatNotice {
	message: string;
	status?: 'success' | 'warning' | 'error';
	action?: { label: string; onClick: () => void };
	dismissible?: boolean;
	/** The persistent notice replaces this specific backend rejection. */
	suppressCurrentError?: boolean;
}

// Keep this structural result compatible with ChatNoticeResult across the provider boundary.
export type JetpackAiChatNoticeResult =
	| JetpackAiChatNotice
	| {
			message?: never;
			status?: never;
			action?: never;
			dismissible?: never;
			suppressCurrentError: true;
	  };

export function getTrustedUpgradeUrl( value: string ): string | null {
	try {
		const url = new URL( value.replace( /[.,;:!?)\]}]+$/, '' ) );
		const isSameOriginMyJetpackUrl =
			typeof window !== 'undefined' &&
			url.protocol === window.location.protocol &&
			url.origin === window.location.origin &&
			url.username === '' &&
			url.password === '' &&
			/(?:^|\/)wp-admin\/admin\.php$/.test( url.pathname ) &&
			url.search === '?page=my-jetpack' &&
			url.hash === '#/add-jetpack-ai';

		return isSameOriginMyJetpackUrl ? url.href : null;
	} catch {
		return null;
	}
}

export function openJetpackAiUpgrade( upgradeUrl: string, recordUpgradeClick?: () => void ): void {
	try {
		recordUpgradeClick?.();
	} catch {
		// Analytics must never block checkout navigation.
	}
	window.open( upgradeUrl, '_blank', 'noopener,noreferrer' );
}

function findUpgradeUrlInMessage( message: string ): string | null {
	for ( const [ candidate ] of message.matchAll( /https?:\/\/[^\s<>"']+/g ) ) {
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
	recoveryRevision: number;
	scopeKey: string | null;
	upgradeUrl: string | null;
}

/**
 * Show a persistent notice after the backend rejects an exhausted request.
 * The backend remains the only admission authority and every later submit is
 * still sent for a fresh quota check.
 */
export function useChatNotice( {
	error,
	recoveryRevision = 0,
	recordUpgradeClick,
	scopeKey = null,
}: {
	error: string | null;
	recoveryRevision?: number;
	recordUpgradeClick?: () => void;
	scopeKey?: string | null;
} ): JetpackAiChatNoticeResult | undefined {
	const [ exhausted, setExhausted ] = useState< ExhaustedState | null >( null );
	const previousErrorRef = useRef< string | null >( null );
	const currentErrorIsQuotaExhaustion = isQuotaExhaustedError( error );
	const rejectionUpgradeUrl = currentErrorIsQuotaExhaustion
		? findUpgradeUrlInMessage( error )
		: null;
	const scopedExhausted = exhausted?.scopeKey === scopeKey ? exhausted : null;
	const recoverySupersedesRejection =
		currentErrorIsQuotaExhaustion &&
		scopedExhausted !== null &&
		recoveryRevision > scopedExhausted.recoveryRevision;
	const visibleExhausted =
		scopedExhausted && recoveryRevision <= scopedExhausted.recoveryRevision
			? scopedExhausted
			: null;

	useEffect( () => {
		const isNewQuotaRejection = currentErrorIsQuotaExhaustion && error !== previousErrorRef.current;
		previousErrorRef.current = error;

		if ( isNewQuotaRejection ) {
			setExhausted( ( current ) => ( {
				recoveryRevision,
				scopeKey,
				upgradeUrl:
					rejectionUpgradeUrl ?? ( current?.scopeKey === scopeKey ? current.upgradeUrl : null ),
			} ) );
			return;
		}
		if ( currentErrorIsQuotaExhaustion ) {
			return;
		}

		setExhausted( ( current ) => {
			if ( ! current ) {
				return current;
			}
			if ( current.scopeKey !== scopeKey || recoveryRevision > current.recoveryRevision ) {
				return null;
			}
			return current;
		} );
	}, [ error, currentErrorIsQuotaExhaustion, recoveryRevision, rejectionUpgradeUrl, scopeKey ] );

	const upgradeUrl = rejectionUpgradeUrl ?? visibleExhausted?.upgradeUrl ?? null;
	const onUpgradeClick = useCallback( () => {
		if ( ! upgradeUrl ) {
			return;
		}

		openJetpackAiUpgrade( upgradeUrl, recordUpgradeClick );
	}, [ recordUpgradeClick, upgradeUrl ] );

	return useMemo( () => {
		if ( recoverySupersedesRejection ) {
			return { suppressCurrentError: true };
		}
		if ( ! currentErrorIsQuotaExhaustion && ! visibleExhausted ) {
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
	}, [
		currentErrorIsQuotaExhaustion,
		onUpgradeClick,
		recoverySupersedesRejection,
		upgradeUrl,
		visibleExhausted,
	] );
}
