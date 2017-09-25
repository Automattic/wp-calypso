/**
 * External dependencies
 */
import classnames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import safeImageURL from 'lib/safe-image-url';
import qs from 'querystring';
import { getUserTempGravatar } from 'state/current-user/gravatar-status/selectors';
import url from 'url';

export class Gravatar extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			failedToLoad: false,
		};
	}

	static propTypes = {
		user: PropTypes.object,
		size: PropTypes.number,
		imgSize: PropTypes.number,
		// connected props:
		tempImage: PropTypes.oneOfType( [
			PropTypes.string, // the temp image base64 string if it exists
			PropTypes.bool, // or false if the temp image does not exist
		] ),
	};

	static defaultProps = {
		// The REST-API returns s=96 by default, so that is most likely to be cached
		imgSize: 96,
		size: 32,
	};

	getResizedImageURL( imageURL ) {
		const { imgSize } = this.props;
		imageURL = imageURL || 'https://www.gravatar.com/avatar/0';
		const parsedURL = url.parse( imageURL );
		const query = qs.parse( parsedURL.query );

		if ( /^([-a-zA-Z0-9_]+\.)*(gravatar.com)$/.test( parsedURL.hostname ) ) {
			query.s = imgSize;
			query.d = 'mm';
		} else {
			// assume photon
			query.resize = imgSize + ',' + imgSize;
		}

		parsedURL.search = qs.stringify( query );
		return url.format( parsedURL );
	}

	onError = () => this.setState( { failedToLoad: true } );

	render() {
		const { alt, size, tempImage, user } = this.props;

		if ( ! user ) {
			return <span className="gravatar is-placeholder" style={ { width: size, height: size } } />;
		}

		if ( this.state.failedToLoad && ! tempImage ) {
			return <span className="gravatar is-missing" />;
		}

		const altText = alt || user.display_name;
		const avatarURL = tempImage || this.getResizedImageURL( safeImageURL( user.avatar_URL ) );
		const classes = classnames( 'gravatar', this.props.className );

		return (
			<img
				alt={ altText }
				className={ classes }
				src={ avatarURL }
				width={ size }
				height={ size }
				onError={ this.onError }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	tempImage: getUserTempGravatar( state, get( ownProps, 'user.ID', false ) ),
} ) )( Gravatar );
