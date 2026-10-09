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
	domainChoice?: string;
}

export interface StaticSiteImport {
	status: 'moving' | 'finished' | 'failed';
	session?: StaticSiteImportSession;
	errorCode?: string;
	/** The preview expired or is gone, so the source has to be read again. */
	needsRestart: boolean;
	/** Set when starting the move failed and it's worth asking again. */
	retry?: () => void;
}

const RESTART_CODES = [
	'static_site_import_session_not_found',
	'static_site_import_preview_expired',
	'static_site_import_archive_mismatch',
];

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

	// The user asked for the move before checkout; now the site has a plan, start it.
	const hasRequestedApproval = useRef( false );
	useEffect( () => {
		if (
			! sessionId ||
			hasRequestedApproval.current ||
			session?.state !== 'preview_ready' ||
			! session.archive_hash
		) {
			return;
		}
		hasRequestedApproval.current = true;
		approve(
			{ sessionId, archiveHash: session.archive_hash, destinationBlogId: site.ID },
			{ onSettled: () => refetch() }
		);
	}, [ approve, refetch, session, sessionId, site.ID ] );

	if ( ! sessionId ) {
		return null;
	}

	const errorCode =
		getStaticSiteImportErrorCode( approveError ) ?? getStaticSiteImportErrorCode( sessionError );
	const needsRestart =
		RESTART_CODES.includes( errorCode ?? '' ) ||
		( session?.state === 'failed' && ! session.site_url );
	const approveFailed =
		Boolean( approveError ) && errorCode !== 'static_site_import_session_already_approved';
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
		status: session?.state === 'finished' ? 'finished' : 'moving',
		session,
		needsRestart: false,
	};
}
