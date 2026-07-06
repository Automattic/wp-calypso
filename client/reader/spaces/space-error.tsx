import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

/** HTTP status off a failed wpcom request, or `undefined` when none is present. */
export function getSpaceErrorStatus( error: unknown ): number | undefined {
	if ( error && typeof error === 'object' && 'status' in error ) {
		const { status } = error as { status?: unknown };
		if ( typeof status === 'number' ) {
			return status;
		}
	}
	return undefined;
}

/**
 * Whether a failed space-detail request means the space can't be shown: a 404
 * (it's gone or isn't the viewer's) or a 403 (no access). The backend collapses
 * "not yours" into the 404, so this doesn't distinguish the two. Falls back to
 * the wpcom error code when no numeric status is present. Other failures are
 * transient and left to degrade gracefully via the list and stream.
 */
export function isSpaceUnavailable( error: unknown ): boolean {
	const status = getSpaceErrorStatus( error );
	if ( status === 404 || status === 403 ) {
		return true;
	}
	if ( error && typeof error === 'object' ) {
		const record = error as { code?: unknown; error?: unknown };
		const code = typeof record.code === 'string' ? record.code : record.error;
		return code === 'reader_spaces_not_found' || code === 'rest_forbidden';
	}
	return false;
}

interface Props {
	spaceId: string;
	error: unknown;
}

/** Full-page state for a space that doesn't exist or isn't the viewer's. */
export function SpaceError( { spaceId, error }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_spaces_page_error', {
				space_id: spaceId,
				status: getSpaceErrorStatus( error ) ?? null,
			} )
		);
	}, [ dispatch, error, spaceId ] );

	return (
		<ReaderMain>
			<DocumentHead title={ translate( 'Spaces ‹ Reader' ) } />
			<EmptyContent
				title={ translate( 'This space isn’t available' ) }
				line={ translate( 'It may have been removed, or it’s not one of your spaces.' ) }
				action={ translate( 'Back to Reader' ) }
				actionURL="/reader"
			/>
		</ReaderMain>
	);
}
