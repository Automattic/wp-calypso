import debug from 'debug';
import { localize } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { setSection } from 'calypso/state/ui/section/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:layout' );
const noop = () => {};
const LoadingErrorMessage = localize( ( { translate } ) => (
	<EmptyContent title={ translate( "We're sorry, but an unexpected error has occurred" ) } />
) );

export function isRetry() {
	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.get( 'retry' ) === '1';
}

export function retry( chunkName ) {
	if ( ! isRetry() ) {
		const searchParams = new URLSearchParams( window.location.search );

		bumpStat( 'calypso_chunk_retry', chunkName );

		// Trigger a full page load which should include script tags for the current chunk
		searchParams.set( 'retry', '1' );
		window.location.search = searchParams.toString();
	}
}

export function show( context, chunkName ) {
	log( 'Chunk %s could not be loaded', chunkName );
	bumpStat( 'calypso_chunk_error', chunkName );
	context.store.dispatch( setSection( false, { section: false } ) );
	context.primary = <LoadingErrorMessage />;
	makeLayout( context, noop );
	clientRender( context );
}
