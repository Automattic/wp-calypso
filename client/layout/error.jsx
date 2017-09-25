/**
 * External dependencies
 */
import debug from 'debug';
import { localize } from 'i18n-calypso';
import { assign } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import analytics from 'lib/analytics';
import qs from 'querystring';
import url from 'url';

/**
 * Module variables
 */
const log = debug( 'calypso:layout' );

class LoadingError extends React.Component {
	static isRetry() {
		const parsed = url.parse( location.href, true );
		return parsed.query.retry === '1';
	}

	static retry( chunkName ) {
		let parsed;
		if ( ! LoadingError.isRetry() ) {
			parsed = url.parse( location.href, true );

			analytics.mc.bumpStat( 'calypso_chunk_retry', chunkName );

			// Trigger a full page load which should include script tags for the current chunk
			window.location.search = qs.stringify( assign( parsed.query, { retry: '1' } ) );
		}
	}

	static show( chunkName ) {
		log( 'Chunk %s could not be loaded', chunkName );
		analytics.mc.bumpStat( 'calypso_chunk_error', chunkName );
		ReactDom.render(
			React.createElement( LoadingError, {} ),
			document.getElementById( 'primary' )
		);
	}

	render() {
		return (
		    <EmptyContent
				illustration="/calypso/images/illustrations/illustration-500.svg"
				title={ this.props.translate( 'We\'re sorry, but an unexpected error has occurred' ) } />
		);
	}
}

export default localize( LoadingError );
