/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import safeImageURL from 'calypso/lib/safe-image-url';
import {
	getUrlParts,
	getUrlFromParts,
	determineUrlType,
	URL_TYPE,
	format as formatUrl,
} from 'calypso/lib/url';
import { getUserTempGravatar } from 'calypso/state/current-user/gravatar-status/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class Gravatar extends Component {
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

	state = { failedToLoad: false };

	getResizedImageURL( imageURL ) {
		const { imgSize } = this.props;
		const defaultUrl = 'https://www.gravatar.com/avatar/0';
		imageURL = imageURL || defaultUrl;
		const urlType = determineUrlType( imageURL );

		if ( urlType === URL_TYPE.INVALID || urlType === URL_TYPE.PATH_RELATIVE ) {
			return defaultUrl;
		}

		const { search, origin, host, ...parsedURL } = getUrlParts( imageURL );

		if ( /^([-a-zA-Z0-9_]+\.)*(gravatar.com)$/.test( parsedURL.hostname ) ) {
			parsedURL.searchParams.set( 's', imgSize );
			parsedURL.searchParams.set( 'd', 'mm' );
		} else {
			// assume photon
			parsedURL.searchParams.set( 'resize', `${ imgSize },${ imgSize }` );
		}

		// getUrlFromParts can only handle absolute URLs, so add dummy data if needed.
		// formatUrl will remove it away, to match the previous url type.
		parsedURL.protocol = parsedURL.protocol || 'https:';
		parsedURL.hostname = parsedURL.hostname || '__domain__.invalid';
		return formatUrl( getUrlFromParts( parsedURL ), urlType );
	}

	onError = () => this.setState( { failedToLoad: true } );

	render() {
		const { alt, title, size, tempImage, user } = this.props;

		if ( ! user ) {
			return <span className="gravatar is-placeholder" style={ { width: size, height: size } } />;
		}

		if ( this.state.failedToLoad && ! tempImage ) {
			return <span className="gravatar is-missing" />;
		}

		const altText = alt || user.display_name || user.name;
		const avatarURL = tempImage || this.getResizedImageURL( safeImageURL( user.avatar_URL ) );
		const classes = classnames( 'gravatar', this.props.className );

		return (
			<img
				alt={ altText }
				title={ title }
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
