import {
	STATIC_SITE_IMPORT_TERMINAL_STATES,
	getStaticSiteImportErrorCode,
} from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	isPermanentStaticSiteImportError,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
	wowFunnelPendingQuery,
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
	status: 'moving' | 'finished' | 'failed';
	session?: StaticSiteImportSession;
	errorCode?: string;
	/** A site check refused the built site, so no other route applies. */
	isRefused?: boolean;
	/** The session is gone, so the source has to be read again. */
	needsRestart: boolean;
	/** Set when starting the move failed and it's worth asking again. */
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

	// Only a finished move can be a preview with a share link, and the lookup is per user, not per site.
	const isFinished = Boolean( sessionId ) && session?.state === 'finished';
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

	const errorCode =
		getStaticSiteImportErrorCode( approveError ) ?? getStaticSiteImportErrorCode( sessionError );
	const isRefused = session?.receipt?.code === 'static_site_capture_blocked';
	const needsRestart =
		! isRefused &&
		( errorCode === 'static_site_import_session_not_found' ||
			( session?.state === 'failed' && ! session.site_url ) );
	const approveFailed =
		Boolean( approveError ) &&
		errorCode !== 'static_site_import_session_already_approved' &&
		errorCode !== 'static_site_import_session_approval_in_progress';
	const hasFailed =
		needsRestart ||
		approveFailed ||
		session?.state === 'failed' ||
		isPermanentStaticSiteImportError( sessionError );

	if ( hasFailed ) {
		return {
			status: 'failed',
			session,
			errorCode,
			isRefused,
			needsRestart,
			retry:
				approveFailed && ! needsRestart
					? () => {
							resetApprove();
							hasRequestedApproval.current = false;
							refetch();
						}
					: undefined,
		};
	}

	return {
		status: isFinished ? 'finished' : 'moving',
		session,
		needsRestart: false,
		isPreview: Boolean( preview ),
		previewUrl: preview?.share_url || undefined,
	};
}
