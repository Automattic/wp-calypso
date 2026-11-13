import {
	STATIC_SITE_IMPORT_TERMINAL_STATES,
	getStaticSiteImportErrorCode,
} from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	isPermanentStaticSiteImportError,
	pollStaticSiteImportSessionUntil,
	siteQueryFilter,
	staticSiteImportSessionQuery,
	wowFunnelPendingQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
	/** The site is an unpaid preview site, known once the move has finished. */
	isPreview?: boolean;
	/** Where a finished preview opens past Coming Soon, once the server has made its share link. */
	previewUrl?: string;
}

// The share link is made when the build lands, so a finished preview can briefly read without one.
const PREVIEW_URL_POLL_INTERVAL = 3000;
const PREVIEW_URL_MAX_POLLS = 10;

export const getSourceHost = ( url = '' ) => {
	try {
		const withScheme = /^https?:\/\//i.test( url ) ? url : `https://${ url }`;
		return new URL( withScheme ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
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
	const { mutate: approve, error: approveError } = useMutation(
		approveStaticSiteImportSessionMutation()
	);

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

	// Only a finished move can be a preview with a share link, and the lookup is per user, not per site.
	const isFinished = Boolean( sessionId ) && session?.state === 'finished';

	// A bought site is launched as its move finishes, so the site read while it ran is out of date.
	const queryClient = useQueryClient();
	useEffect( () => {
		if ( isFinished ) {
			queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
		}
	}, [ isFinished, queryClient, site.ID ] );
	const { data: pending } = useQuery( {
		...wowFunnelPendingQuery(),
		enabled: isFinished,
		staleTime: 0,
		refetchInterval: ( query ) => {
			const preview = query.state.data?.preview_sites?.find( ( p ) => p.blog_id === site.ID );
			return preview && ! preview.share_url && query.state.dataUpdateCount < PREVIEW_URL_MAX_POLLS
				? PREVIEW_URL_POLL_INTERVAL
				: false;
		},
	} );
	const preview = isFinished
		? pending?.preview_sites?.find( ( p ) => p.blog_id === site.ID )
		: undefined;

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
	if ( isFinished ) {
		return {
			status: 'finished',
			session,
			isPreview: Boolean( preview ),
			previewUrl: preview?.share_url || undefined,
		};
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
				approve( { sessionId, destinationBlogId: site.ID }, { onSettled: () => refetch() } );
			},
		};
	}

	return { status: 'moving', session };
}
