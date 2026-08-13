import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trackJetpackAiUpgrade } from './utils/tracking';

/**
 * Backend contract. WordPress.com is the only admission authority: every user
 * turn is dispatched, and a turn that has no credit left is rejected by the
 * agent request before chat persistence, Agent execution, or tool work.
 *
 * Agenttic 0.1.87 surfaces only the JSON-RPC `error.message` string (wrapped as
 * `Protocol request error: <message>` or `Streaming error: <message>`), so the
 * rejection has to be recognized from that text. Today's WPCOM endpoint answers
 * with the human sentence; the stable code is matched too so a later backend
 * that includes it keeps working without a client release.
 */
const QUOTA_EXHAUSTED_CODE_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?jetpack_ai_quota_exhausted(?:[.!:\s]|$)/i;

/** Human message the current WPCOM agent request returns for an exhausted quota. */
const QUOTA_EXHAUSTED_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?(?:you have reached your jetpack ai usage limit|jetpack ai usage limit reached)(?:[.!:\s]|$)/i;

/** Exact checkout hosts. Subdomains and same-origin URLs are not accepted. */
const TRUSTED_UPGRADE_HOSTS = [ 'wordpress.com', 'jetpack.com' ];

export interface JetpackAiChatNotice {
	message: string;
	status?: 'success' | 'warning' | 'error';
	action?: { label: string; onClick: () => void };
	dismissible?: boolean;
	/** The persistent notice replaces this specific backend rejection. */
	suppressCurrentError?: boolean;
}

/**
 * Display metadata the server inlines for Free Simple sites. It only chooses the
 * notice copy and the Upgrade destination — the backend still decides whether a
 * turn runs, so nothing here gates submission.
 */
export interface JetpackAiQuota {
	plan: 'free' | 'paid' | 'included';
	/** Server's view of exhaustion at page load. Seeds the notice; never blocks. */
	exhausted: boolean;
	upgradeUrl: string | null;
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null;
}

function getTrustedUpgradeUrl( value: unknown ): string | null {
	if ( typeof value !== 'string' || ! value ) {
		return null;
	}

	try {
		const url = new URL( value );
		return url.protocol === 'https:' && TRUSTED_UPGRADE_HOSTS.includes( url.hostname )
			? url.href
			: null;
	} catch {
		return null;
	}
}

/**
 * Reads the server-injected quota snapshot. Anything that does not match the
 * documented shape is discarded rather than partially trusted.
 * @param value - Raw `agentsManagerData.jetpackAiQuota` value.
 */
export function normalizeJetpackAiQuota( value: unknown ): JetpackAiQuota | undefined {
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	if ( value.plan !== 'free' && value.plan !== 'paid' && value.plan !== 'included' ) {
		return undefined;
	}

	return {
		plan: value.plan,
		exhausted: value.exhausted === true,
		upgradeUrl: isRecord( value.upgrade ) ? getTrustedUpgradeUrl( value.upgrade.url ) : null,
	};
}

/**
 * Picks the first checkout link a rejection message carries. Backends that word
 * the rejection like Image Studio's put the Upgrade destination in the message
 * itself; it goes through the same exact-host check as the inline snapshot, and
 * an untrusted or malformed link is dropped rather than followed.
 * @param message - Backend rejection text.
 */
function findUpgradeUrlInMessage( message: string ): string | null {
	for ( const [ candidate ] of message.matchAll( /https:\/\/[^\s<>"']+/g ) ) {
		const url = getTrustedUpgradeUrl( candidate.replace( /[.,;:!?)\]}]+$/, '' ) );
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

/** Latched presentation state. Display-only — it never gates a submission. */
interface ExhaustedState {
	isExhausted: boolean;
	upgradeUrl: string | null;
}

/**
 * Renders the persistent out-of-credits notice above the composer once the
 * backend has rejected a turn. There is no client-side admission: the notice is
 * purely a reaction to the server's answer, and submission is never blocked.
 *
 * Agenttic clears `error` at the start of every later send, so the exhausted
 * presentation is latched after the first matching rejection instead of being
 * derived from the live error.
 * @param props       - Hook props.
 * @param props.error - Agenttic's current error string.
 */
export function useChatNotice( {
	error,
}: {
	error: string | null;
} ): JetpackAiChatNotice | undefined {
	const quota = useMemo(
		() =>
			typeof agentsManagerData === 'undefined'
				? undefined
				: normalizeJetpackAiQuota( agentsManagerData?.jetpackAiQuota ),
		[]
	);
	const [ exhausted, setExhausted ] = useState< ExhaustedState >( () => ( {
		isExhausted: quota?.exhausted ?? false,
		upgradeUrl: null,
	} ) );
	const currentErrorIsQuotaExhaustion = isQuotaExhaustedError( error );
	const rejectionUpgradeUrl = currentErrorIsQuotaExhaustion
		? findUpgradeUrlInMessage( error )
		: null;
	const isExhausted = exhausted.isExhausted || currentErrorIsQuotaExhaustion;

	useEffect( () => {
		if ( ! isQuotaExhaustedError( error ) ) {
			return;
		}

		setExhausted( ( current ) => ( {
			isExhausted: true,
			upgradeUrl: rejectionUpgradeUrl ?? current.upgradeUrl,
		} ) );
	}, [ error, rejectionUpgradeUrl ] );

	// The rejection's own link wins over the page-load snapshot, which may predate
	// a plan change.
	const upgradeUrl = rejectionUpgradeUrl ?? exhausted.upgradeUrl ?? quota?.upgradeUrl ?? null;
	const onUpgradeClick = useCallback( () => {
		if ( ! upgradeUrl ) {
			return;
		}

		try {
			trackJetpackAiUpgrade();
		} catch {
			// Analytics must never block the user from reaching checkout.
		}
		window.location.assign( upgradeUrl );
	}, [ upgradeUrl ] );

	return useMemo( () => {
		if ( ! isExhausted ) {
			return undefined;
		}

		return {
			message:
				quota?.plan === 'free'
					? __( 'You’re out of free credits.', __i18n_text_domain__ )
					: __( 'No AI requests remaining', __i18n_text_domain__ ),
			status: 'error' as const,
			dismissible: false,
			suppressCurrentError: currentErrorIsQuotaExhaustion,
			action: upgradeUrl
				? { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgradeClick }
				: undefined,
		};
	}, [ currentErrorIsQuotaExhaustion, isExhausted, onUpgradeClick, quota?.plan, upgradeUrl ] );
}
