import { isWpError } from '@automattic/api-core';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

/** HTTP status off a failed wpcom request, or `undefined` when it isn't a wpcom error. */
export function getShelfErrorStatus( error: unknown ): number | undefined {
	return isWpError( error ) ? error.status : undefined;
}

/**
 * Whether a failed shelf-detail request means the shelf can't be shown: a 404
 * (it's gone or isn't the viewer's) or a 403 (no access). The backend collapses
 * "not yours" into the 404, so this doesn't distinguish the two. Other failures
 * are transient and left to degrade gracefully via the list and stream.
 */
export function isShelfUnavailable( error: unknown ): boolean {
	const status = getShelfErrorStatus( error );
	return status === 404 || status === 403;
}

interface Props {
	// The URL slug we failed to resolve. On a 404 there's no numeric id to log (the
	// shelf is unknown / renamed away / not the viewer's), so the slug is the
	// identifier we have.
	slug: string;
	error: unknown;
}

/** Full-page state for a shelf that doesn't exist or isn't the viewer's. */
export function ShelfError( { slug, error }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_shelves_page_error', {
				shelf_slug: slug,
				status: getShelfErrorStatus( error ) ?? null,
			} )
		);
	}, [ dispatch, error, slug ] );

	return (
		<ReaderMain>
			<DocumentHead title={ translate( 'Shelves ‹ Reader' ) } />
			<EmptyContent
				title={ translate( 'This shelf isn’t available' ) }
				line={ translate( 'It may have been removed, or its address has changed.' ) }
				action={ translate( 'Back to Reader' ) }
				actionURL="/reader"
			/>
		</ReaderMain>
	);
}
