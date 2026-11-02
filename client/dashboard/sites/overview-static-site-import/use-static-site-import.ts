import {
	STATIC_SITE_IMPORT_TERMINAL_STATES,
	getStaticSiteImportErrorCode,
} from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	isPermanentStaticSiteImportError,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import type { Site, StaticSiteImportSession } from '@automattic/api-core';

export interface StaticSiteImportSearch {
	importSessionId?: string;
	from?: string;
	platform?: string;
}

export interface StaticSiteImport {
	/**
	 * - moving: the move is running.
	 * - finished / failed: the move itself reported that state.
	 * - stalled: naming this site as the destination failed; asking again may work.
	 * - unavailable: this move can't be read for this viewer (another account's move,
	 *   a wrong or expired link). It isn't a failed move.
	 */
	status: 'moving' | 'finished' | 'failed' | 'stalled' | 'unavailable';
	session?: StaticSiteImportSession;
	/** A site check refused the built site, so no other route applies. */
	isRefused?: boolean;
	/** Set when the move is stalled: asks again to name this site as the destination. */
	retry?: () => void;
}

export const getSourceHost = ( url = '' ) => {
	try {
		const withScheme = /^https?:\/\//i.test( url ) ? url : `https://${ url }`;
		return new URL( withScheme ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
};

/**
 * Free addresses that site builders give out on their own domains. The customer
 * doesn't own them, so they can't be connected or transferred to WordPress.com.
 */
const PLATFORM_HOST_SUFFIXES = [
	'base44.app',
	'blogspot.com',
	'carrd.co',
	'editorx.io',
	'framer.app',
	'framer.website',
	'github.io',
	'godaddysites.com',
	'hostingersite.com',
	'jimdofree.com',
	'jimdosite.com',
	'lovable.app',
	'mystrikingly.com',
	'myshopify.com',
	'netlify.app',
	'pages.dev',
	'replit.app',
	'site123.me',
	'square.site',
	'squarespace.com',
	'vercel.app',
	'webflow.io',
	'weebly.com',
	'weeblysite.com',
	'wixsite.com',
	'wixstudio.com',
	'wixstudio.io',
	'wordpress.com',
	'wpcomstaging.com',
];

/** Whether the host is a builder's free address rather than a domain the customer owns. */
export const isPlatformHost = ( host = '' ) => {
	const normalized = host.toLowerCase().replace( /\.$/, '' );
	return PLATFORM_HOST_SUFFIXES.some(
		( suffix ) => normalized === suffix || normalized.endsWith( `.${ suffix }` )
	);
};

export function useStaticSiteImport( site: Site, sessionId?: string ): StaticSiteImport | null {
	const {
		data: session,
		error: sessionError,
		refetch,
	} = useQuery( {
		...staticSiteImportSessionQuery( sessionId ?? '' ),
		enabled: Boolean( sessionId ),
		refetchInterval: pollStaticSiteImportSessionUntil( STATIC_SITE_IMPORT_TERMINAL_STATES ),
	} );
	const {
		mutate: approve,
		error: approveError,
		reset: resetApprove,
	} = useMutation( approveStaticSiteImportSessionMutation() );

	// Checkout was the consent, so name this site as the destination right away.
	// The server delivers as soon as the build lands, even if the user has left.
	// `site_url` is set once delivery is bound, after which there's nothing to approve.
	const hasRequestedApproval = useRef( false );
	useEffect( () => {
		if (
			! sessionId ||
			hasRequestedApproval.current ||
			! session ||
			session.site_url ||
			STATIC_SITE_IMPORT_TERMINAL_STATES.includes( session.state )
		) {
			return;
		}
		hasRequestedApproval.current = true;
		approve( { sessionId, destinationBlogId: site.ID }, { onSettled: () => refetch() } );
	}, [ approve, refetch, session, sessionId, site.ID ] );

	if ( ! sessionId ) {
		return null;
	}

	// Only the move's own state decides finished or failed, so a passing error can't
	// make a move that's still running look final.
	if ( session?.state === 'failed' ) {
		return {
			status: 'failed',
			session,
			isRefused: session.receipt?.code === 'static_site_capture_blocked',
		};
	}
	if ( session?.state === 'finished' ) {
		return { status: 'finished', session };
	}
	if ( ! session && isPermanentStaticSiteImportError( sessionError ) ) {
		return { status: 'unavailable' };
	}

	const approveErrorCode = getStaticSiteImportErrorCode( approveError );
	const isStalled =
		Boolean( approveError ) &&
		! session?.site_url &&
		approveErrorCode !== 'static_site_import_session_already_approved' &&
		approveErrorCode !== 'static_site_import_session_approval_in_progress';
	if ( isStalled ) {
		return {
			status: 'stalled',
			session,
			retry: () => {
				resetApprove();
				hasRequestedApproval.current = false;
				refetch();
			},
		};
	}

	return { status: 'moving', session };
}
