import apiFetch from '@wordpress/api-fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { trackJetpackAiUpgrade } from './utils/tracking';
import type { UIMessage } from '@automattic/agenttic-client';

export const JETPACK_AI_QUOTA_EXHAUSTED_CODE = 'jetpack_ai_quota_exhausted';

export type JetpackAiQuota = {
	product: 'wordpress-com-agent' | 'jetpack-ai';
	plan: 'free' | 'paid' | 'included';
	metered: boolean;
	limit: number | null;
	used: number | null;
	remaining: number | null;
	exhausted: boolean;
	upgrade: null | {
		kind: 'wpcom-plan' | 'jetpack-ai';
		url: string;
	};
};

type UnknownRecord = Record< string, unknown >;

export type JetpackAiSubmissionAdmission = {
	submitBlocked: boolean;
	onBlockedSubmit: ( message?: string ) => void;
	refreshAfterTurn?: ( dispatchRevision?: number ) => Promise< void >;
	notice?: {
		message: string;
		status?: 'success' | 'warning' | 'error';
		action?: { label: string; onClick: () => void };
		dismissible?: boolean;
	};
};

function isRecord( value: unknown ): value is UnknownRecord {
	return typeof value === 'object' && value !== null;
}

function nullableNumber( value: unknown ): number | null | undefined {
	if ( value === null ) {
		return null;
	}
	return typeof value === 'number' && Number.isFinite( value ) ? value : undefined;
}

function getApprovedUrl(
	value: unknown,
	kind: NonNullable< JetpackAiQuota[ 'upgrade' ] >[ 'kind' ]
): string | undefined {
	if ( typeof value !== 'string' || ! value.trim() ) {
		return undefined;
	}

	try {
		const base = typeof window === 'undefined' ? 'https://wordpress.com' : window.location.origin;
		const url = new URL( value, base );
		const isSameOrigin = typeof window !== 'undefined' && url.origin === window.location.origin;
		const isWordPressCom =
			url.protocol === 'https:' &&
			( url.hostname === 'wordpress.com' || url.hostname.endsWith( '.wordpress.com' ) );
		const isJetpackCom =
			url.protocol === 'https:' &&
			( url.hostname === 'jetpack.com' || url.hostname.endsWith( '.jetpack.com' ) );
		const isApproved =
			kind === 'wpcom-plan' ? isWordPressCom : isSameOrigin || isJetpackCom || isWordPressCom;
		return isApproved ? value : undefined;
	} catch {
		return undefined;
	}
}

function normalizeUpgrade( value: unknown ): JetpackAiQuota[ 'upgrade' ] | undefined {
	if ( value === null ) {
		return null;
	}
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	if ( value.kind !== 'wpcom-plan' && value.kind !== 'jetpack-ai' ) {
		return undefined;
	}
	const url = getApprovedUrl( value.url, value.kind );
	if ( ! url ) {
		return undefined;
	}

	return { kind: value.kind, url };
}

function normalizeCanonicalQuota( value: unknown ): JetpackAiQuota | undefined {
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	if ( value.product !== 'wordpress-com-agent' && value.product !== 'jetpack-ai' ) {
		return undefined;
	}
	if ( value.plan !== 'free' && value.plan !== 'paid' && value.plan !== 'included' ) {
		return undefined;
	}
	if ( typeof value.metered !== 'boolean' || typeof value.exhausted !== 'boolean' ) {
		return undefined;
	}

	const limit = nullableNumber( value.limit );
	const used = nullableNumber( value.used );
	const remaining = nullableNumber( value.remaining );
	const upgrade = normalizeUpgrade( value.upgrade );
	if (
		limit === undefined ||
		used === undefined ||
		remaining === undefined ||
		upgrade === undefined
	) {
		return undefined;
	}

	return {
		product: value.product,
		plan: value.plan,
		metered: value.metered,
		limit,
		used,
		remaining,
		exhausted: value.exhausted,
		upgrade,
	};
}

function getUpgradeFromTerminalPart(
	value: UnknownRecord,
	product: JetpackAiQuota[ 'product' ]
): JetpackAiQuota[ 'upgrade' ] {
	const option = Array.isArray( value.upgrade_options )
		? value.upgrade_options.find( ( candidate ) => {
				if ( ! isRecord( candidate ) ) {
					return false;
				}
				const expectedKind = product === 'wordpress-com-agent' ? 'wpcom-plan' : 'jetpack-ai';
				return candidate.kind === expectedKind && !! getApprovedUrl( candidate.url, expectedKind );
		  } )
		: undefined;
	const normalizedOption = normalizeUpgrade( option );
	if ( normalizedOption ) {
		return normalizedOption;
	}

	if ( product === 'wordpress-com-agent' ) {
		const url = getApprovedUrl(
			value.wordpress_com_upgrade_url ?? value.jetpack_complete_upgrade_url,
			'wpcom-plan'
		);
		return url ? { kind: 'wpcom-plan', url } : null;
	}

	const url = getApprovedUrl( value.jetpack_ai_upgrade_url, 'jetpack-ai' );
	return url ? { kind: 'jetpack-ai', url } : null;
}

function normalizeExhaustedTerminalPart( value: unknown ): JetpackAiQuota | undefined {
	if (
		! isRecord( value ) ||
		value.code !== JETPACK_AI_QUOTA_EXHAUSTED_CODE ||
		value.state !== 'exhausted' ||
		( value.product !== 'wordpress-com-agent' && value.product !== 'jetpack-ai' ) ||
		( value.plan !== 'free' && value.plan !== 'paid' && value.plan !== 'included' ) ||
		! isRecord( value.usage )
	) {
		return undefined;
	}

	const limit = nullableNumber( value.usage.limit );
	const used = nullableNumber( value.usage.used );
	const remaining = nullableNumber( value.usage.remaining );
	if ( limit === undefined || used === undefined || remaining === undefined ) {
		return undefined;
	}

	return {
		product: value.product,
		plan: value.plan,
		metered: true,
		limit,
		used,
		remaining,
		exhausted: true,
		upgrade: getUpgradeFromTerminalPart( value, value.product ),
	};
}

function normalizeLegacyTerminalUsage( value: unknown ): JetpackAiQuota | undefined {
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	const usage = isRecord( value.jetpack_ai_usage ) ? value.jetpack_ai_usage : undefined;
	if (
		! usage ||
		usage.product !== 'jetpack-ai' ||
		( usage.plan !== 'free' && usage.plan !== 'paid' )
	) {
		return undefined;
	}

	const limit = nullableNumber( usage.limit );
	const used = nullableNumber( usage.used );
	const remaining = nullableNumber( usage.remaining );
	if ( limit === undefined || used === undefined || remaining === undefined ) {
		return undefined;
	}

	return {
		product: 'jetpack-ai',
		plan: usage.plan,
		metered: true,
		limit,
		used,
		remaining,
		exhausted: usage.state === 'exhausted' || remaining === 0,
		upgrade: getUpgradeFromTerminalPart( value, 'jetpack-ai' ),
	};
}

export function normalizeJetpackAiQuota( value: unknown ): JetpackAiQuota | undefined {
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	const clientState = isRecord( value.clientState ) ? value.clientState : undefined;
	const wrappedValue =
		clientState?.jetpackAiQuota ??
		value.jetpackAiQuota ??
		( value.name === 'jetpackAiQuota' ? value.value ?? value.data : undefined );
	if ( wrappedValue !== undefined && wrappedValue !== value ) {
		return normalizeJetpackAiQuota( wrappedValue );
	}

	return (
		normalizeCanonicalQuota( value ) ??
		normalizeExhaustedTerminalPart( value ) ??
		normalizeLegacyTerminalUsage( value )
	);
}

export function normalizeJetpackAiFeatureQuota( value: unknown ): JetpackAiQuota | undefined {
	return normalizeJetpackAiQuota( value );
}

export function jetpackAiClientStateDataPartAdapter(
	data: Record< string, unknown >
): Record< string, unknown > | undefined {
	const quota = normalizeJetpackAiQuota( data );
	return quota ? { jetpackAiQuota: quota } : undefined;
}

export function getJetpackAiQuotaFromMessages(
	messages: Pick< UIMessage, 'content' >[]
): JetpackAiQuota | undefined {
	return findJetpackAiQuotaInMessages( messages )?.quota;
}

function findJetpackAiQuotaInMessages(
	messages: Array< Pick< UIMessage, 'content' > & Partial< Pick< UIMessage, 'id' > > >
): { quota: JetpackAiQuota; identity: string } | undefined {
	for ( let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex-- ) {
		const content = messages[ messageIndex ].content ?? [];
		for ( let partIndex = content.length - 1; partIndex >= 0; partIndex-- ) {
			const part = content[ partIndex ];
			if ( part.type !== 'data' ) {
				continue;
			}
			const quota = normalizeJetpackAiQuota( part.data?.jetpackAiQuota ?? part.data );
			if ( quota ) {
				return {
					quota,
					identity: `${
						messages[ messageIndex ].id ?? messageIndex
					}:${ partIndex }:${ JSON.stringify( quota ) }`,
				};
			}
		}
	}
	return undefined;
}

export function getJetpackAiQuotaFromError( error: unknown ): JetpackAiQuota | undefined {
	if ( ! isRecord( error ) ) {
		return undefined;
	}

	const data = isRecord( error.data ) ? error.data : undefined;
	const stableCode =
		error.code === JETPACK_AI_QUOTA_EXHAUSTED_CODE ||
		data?.code === JETPACK_AI_QUOTA_EXHAUSTED_CODE;
	if ( ! stableCode ) {
		return undefined;
	}

	return normalizeJetpackAiQuota( data?.jetpackAiQuota ?? data );
}

export function openJetpackAiUpgrade( upgrade: NonNullable< JetpackAiQuota[ 'upgrade' ] > ): void {
	window.location.assign( upgrade.url );
}

export function useSubmissionAdmission( {
	messages,
	error,
	dispatchRevision = 0,
	historyRevision = 0,
}: {
	messages: UIMessage[];
	error: unknown;
	dispatchRevision?: number;
	historyRevision?: number;
} ): JetpackAiSubmissionAdmission {
	const meteringEnabled =
		typeof agentsManagerData !== 'undefined' &&
		agentsManagerData?.jetpackAiMeteringEnabled === true;
	const messageQuotaSnapshot = useMemo(
		() => findJetpackAiQuotaInMessages( messages ),
		[ messages ]
	);
	const messageQuota = messageQuotaSnapshot?.quota;
	const errorQuota = useMemo( () => getJetpackAiQuotaFromError( error ), [ error ] );
	const [ terminalState, setTerminalState ] = useState( () => ( {
		dispatchRevision,
		historyRevision,
		observedMessageIdentity: messageQuotaSnapshot?.identity,
		observedError: error,
		baselineMessageIdentity: messageQuotaSnapshot?.identity,
		baselineError: error,
	} ) );
	if (
		terminalState.dispatchRevision !== dispatchRevision ||
		terminalState.historyRevision !== historyRevision ||
		terminalState.observedMessageIdentity !== messageQuotaSnapshot?.identity ||
		terminalState.observedError !== error
	) {
		const historyWasReplaced = terminalState.historyRevision !== historyRevision;
		const dispatchStarted = terminalState.dispatchRevision !== dispatchRevision;
		let baselineMessageIdentity = terminalState.baselineMessageIdentity;
		let baselineError = terminalState.baselineError;
		if ( historyWasReplaced ) {
			baselineMessageIdentity = messageQuotaSnapshot?.identity;
			baselineError = error;
		} else if ( dispatchStarted ) {
			baselineMessageIdentity = terminalState.observedMessageIdentity;
			baselineError = terminalState.observedError;
		}
		// Persisted history is its own baseline and can never masquerade as a live
		// response. A dispatch instead captures the prior render, so a synchronous
		// terminal response in the same React batch is still recognized as new.
		// React owns this state update, so a discarded concurrent render cannot
		// advance the terminal baseline outside the committed tree.
		setTerminalState( {
			dispatchRevision,
			historyRevision,
			observedMessageIdentity: messageQuotaSnapshot?.identity,
			observedError: error,
			baselineMessageIdentity,
			baselineError,
		} );
	}
	let liveTerminalQuota: JetpackAiQuota | undefined;
	if ( dispatchRevision > 0 && errorQuota && error !== terminalState.baselineError ) {
		liveTerminalQuota = errorQuota;
	} else if (
		dispatchRevision > 0 &&
		messageQuota &&
		messageQuotaSnapshot?.identity !== terminalState.baselineMessageIdentity
	) {
		liveTerminalQuota = messageQuota;
	}
	const initialQuotaRef = useRef< JetpackAiQuota | undefined >(
		typeof agentsManagerData === 'undefined'
			? undefined
			: normalizeJetpackAiQuota( agentsManagerData?.jetpackAiQuota )
	);
	const [ serverSnapshot, setServerSnapshot ] = useState( () => ( {
		quota: initialQuotaRef.current,
		// Inline data is generated independently of persisted conversation history.
		// It therefore covers everything loaded before the first live dispatch.
		coversDispatchRevision: initialQuotaRef.current ? 0 : -1,
	} ) );
	const latestRefreshRequestRef = useRef( 0 );
	const refreshAfterTurn = useCallback(
		async ( coveredDispatchRevision?: number ) => {
			if ( ! meteringEnabled ) {
				return;
			}

			const requestId = latestRefreshRequestRef.current + 1;
			latestRefreshRequestRef.current = requestId;
			const coversDispatchRevision = coveredDispatchRevision ?? dispatchRevision;
			try {
				const feature = await apiFetch< unknown >( {
					path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
				} );
				const quota = normalizeJetpackAiFeatureQuota( feature );
				if ( quota && requestId === latestRefreshRequestRef.current ) {
					setServerSnapshot( {
						quota,
						coversDispatchRevision,
					} );
				}
			} catch {
				// The turn endpoint remains authoritative when refresh is unavailable.
			}
		},
		[ dispatchRevision, meteringEnabled ]
	);

	const requestedInitialRefreshRef = useRef( false );
	useEffect( () => {
		if ( ! meteringEnabled || requestedInitialRefreshRef.current ) {
			return;
		}

		requestedInitialRefreshRef.current = true;
		void refreshAfterTurn( 0 );
	}, [ meteringEnabled, refreshAfterTurn ] );

	let currentQuota: JetpackAiQuota | undefined;
	if ( meteringEnabled ) {
		currentQuota = serverSnapshot.quota;
		if ( liveTerminalQuota && dispatchRevision > serverSnapshot.coversDispatchRevision ) {
			currentQuota = liveTerminalQuota;
		}
	}

	const submitBlocked = currentQuota?.metered === true && currentQuota.exhausted === true;
	const navigateToUpgrade = useCallback(
		( placement: 'jetpack-ai-sidebar-quota-notice' | 'jetpack-ai-sidebar-blocked-submit' ) => {
			if ( ! currentQuota?.upgrade ) {
				return;
			}

			try {
				trackJetpackAiUpgrade( { placement, requestsCount: currentQuota.used } );
			} catch {
				// Analytics must never block the user from reaching checkout.
			}
			openJetpackAiUpgrade( currentQuota.upgrade );
		},
		[ currentQuota?.upgrade, currentQuota?.used ]
	);
	const onUpgradeClick = useCallback( () => {
		navigateToUpgrade( 'jetpack-ai-sidebar-quota-notice' );
	}, [ navigateToUpgrade ] );
	const onBlockedSubmit = useCallback( () => {
		navigateToUpgrade( 'jetpack-ai-sidebar-blocked-submit' );
	}, [ navigateToUpgrade ] );

	if ( ! currentQuota || currentQuota.metered === false ) {
		return { submitBlocked: false, onBlockedSubmit, refreshAfterTurn };
	}

	const action = currentQuota.upgrade
		? {
				label: __( 'Upgrade', __i18n_text_domain__ ),
				onClick: onUpgradeClick,
		  }
		: undefined;
	let notice: JetpackAiSubmissionAdmission[ 'notice' ];
	if ( currentQuota.plan === 'free' && submitBlocked ) {
		notice = {
			message: __( 'You’re out of free credits.', __i18n_text_domain__ ),
			status: 'error',
			action,
			dismissible: false,
		};
	} else if ( currentQuota.plan === 'free' && currentQuota.remaining !== null ) {
		notice = {
			message: sprintf(
				/* translators: %d is the number of free AI credits remaining. */
				_n(
					'%d free credit left',
					'%d free credits left',
					currentQuota.remaining,
					__i18n_text_domain__
				),
				currentQuota.remaining
			),
			action,
			dismissible: false,
		};
	} else if ( currentQuota.plan === 'paid' && submitBlocked ) {
		notice = {
			message: __( 'No AI requests remaining', __i18n_text_domain__ ),
			status: 'error',
			action,
			dismissible: false,
		};
	}

	return {
		submitBlocked,
		onBlockedSubmit,
		refreshAfterTurn,
		notice,
	};
}
