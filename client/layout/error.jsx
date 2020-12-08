/**
 * External dependencies
 */
import debug from 'debug';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { bumpStat } from 'calypso/lib/analytics/mc';
import EmptyContent from 'calypso/components/empty-content';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { SECTION_SET } from 'calypso/state/action-types';

/**
 * Module variables
 */
const log = debug( 'calypso:layout' );

const LoadingErrorMessage = localize( ( { translate } ) => (
	<EmptyContent
		illustration="/calypso/images/illustrations/error.svg"
		title={ translate( "We're sorry, but an unexpected error has occurred" ) }
	/>
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
	context.store.dispatch( {
		type: SECTION_SET,
		section: false,
	} );
	context.primary = <LoadingErrorMessage />;
	makeLayout( context, noop );
	clientRender( context );
}
