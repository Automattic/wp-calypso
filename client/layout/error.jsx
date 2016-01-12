/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	assign = require( 'lodash/object/assign' ),
	url = require( 'url' ),
	qs = require( 'querystring' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	EmptyContent = require( 'components/empty-content' );

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
			console.error( 'Chunk %s could not be loaded', chunkName );
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
				illustration="/calypso/images/drake/drake-500.svg"
				title={ this.translate( 'We\'re sorry, but an unexpected error has occurred' ) } />
		);
	}

} );

module.exports = LoadingError;
