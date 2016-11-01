/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import qs from 'querystring';

/**
 * Internal dependencies
 */
import safeImageURL from 'lib/safe-image-url';

module.exports = React.createClass( {
	displayName: 'Gravatar',

	propTypes: {
		user: React.PropTypes.object,
		size: React.PropTypes.number,
		imgSize: React.PropTypes.number
	},

	getDefaultProps() {
		// The REST-API returns s=96 by default, so that is most likely to be cached
		return {
			imgSize: 96,
			size: 32
		};
	},

	getInitialState() {
		return {
			failedToLoad: false
		};
	},

	getResizedImageURL( imageURL ) {
		imageURL = imageURL || 'https://www.gravatar.com/avatar/0';
		const parsedURL = url.parse( imageURL );
		const query = qs.parse( parsedURL.query );

		if ( /^([-a-zA-Z0-9_]+\.)*(gravatar.com)$/.test( parsedURL.hostname ) ) {
			query.s = this.props.imgSize;
			query.d = 'mm';
		} else {
			// assume photon
			query.resize = this.props.imgSize + ',' + this.props.imgSize;
		}

		parsedURL.search = qs.stringify( query );
		return url.format( parsedURL );
	},

	onError() {
		this.setState( { failedToLoad: true } );
	},

	render() {
		const size = this.props.size;

		if ( ! this.props.user ) {
			return <span className="gravatar is-placeholder" style={ { width: size, height: size } } />;
		} else if ( this.state.failedToLoad ) {
			return <span className="gravatar is-missing" />;
		}

		const alt = this.props.alt || this.props.user.display_name;
		const avatarURL = this.getResizedImageURL( safeImageURL( this.props.user.avatar_URL ) );

		return (
			<img alt={ alt } className="gravatar" src={ avatarURL } width={ size } height={ size } onError={ this.onError } />
		);
	}
} );
