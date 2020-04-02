/**
 * External dependencies
 */
import debug from 'debug';
import { localize } from 'i18n-calypso';
import { assign, noop } from 'lodash';
import React from 'react';
import url from 'url';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { bumpStat } from 'lib/analytics/mc';
import EmptyContent from 'components/empty-content';
import { makeLayout, render as clientRender } from 'controller';
import { SECTION_SET } from 'state/action-types';

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
	const parsed = url.parse( window.location.href, true );
	return parsed.query.retry === '1';
}

export function retry( chunkName ) {
	if ( ! isRetry() ) {
		const parsed = url.parse( window.location.href, true );

		bumpStat( 'calypso_chunk_retry', chunkName );

		// Trigger a full page load which should include script tags for the current chunk
		window.location.search = stringify( assign( parsed.query, { retry: '1' } ) );
	}
}

export function show( context, chunkName ) {
	log( 'Chunk %s could not be loaded', chunkName );
	bumpStat( 'calypso_chunk_error', chunkName );
	context.store.dispatch( {
		type: SECTION_SET,
		section: false,
		hasSidebar: false,
	} );
	context.primary = <LoadingErrorMessage />;
	makeLayout( context, noop );
	clientRender( context );
}
