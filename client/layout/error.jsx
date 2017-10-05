/**
 * External dependencies
 */
import debug from 'debug';
import { assign } from 'lodash';
import ReactDom from 'react-dom';
import React from 'react';
import url from 'url';
import qs from 'querystring';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

import EmptyContent from 'components/empty-content';

/**
 * Module variables
 */
const log = debug( 'calypso:layout' );

var LoadingError = React.createClass( {

	statics: {
		isRetry: function() {
			var parsed = url.parse( location.href, true );
			return parsed.query.retry === '1';
		},

		retry: function( chunkName ) {
			var parsed;
			if ( ! LoadingError.isRetry() ) {
				parsed = url.parse( location.href, true );

				analytics.mc.bumpStat( 'calypso_chunk_retry', chunkName );

				// Trigger a full page load which should include script tags for the current chunk
				window.location.search = qs.stringify( assign( parsed.query, { retry: '1' } ) );
			}
		},

		show: function( chunkName ) {
			log( 'Chunk %s could not be loaded', chunkName );
			analytics.mc.bumpStat( 'calypso_chunk_error', chunkName );
			ReactDom.render(
				React.createElement( LoadingError, {} ),
				document.getElementById( 'primary' )
			);
		}
	},

	render: function() {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-500.svg"
				title={ this.translate( 'We\'re sorry, but an unexpected error has occurred' ) } />
		);
	}

} );

module.exports = LoadingError;
