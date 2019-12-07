/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { parse, stringify } from 'qs';
import { connect } from 'react-redux';
import { get } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import safeImageURL from 'lib/safe-image-url';
import { getUserTempGravatar } from 'state/current-user/gravatar-status/selectors';

/**
 * Style dependencies
 */
import './style.scss';

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
		const query = parse( parsedURL.query );

		if ( /^([-a-zA-Z0-9_]+\.)*(gravatar.com)$/.test( parsedURL.hostname ) ) {
			query.s = imgSize;
			query.d = 'mm';
		} else {
			// assume photon
			query.resize = imgSize + ',' + imgSize;
		}

		parsedURL.search = stringify( query );
		return url.format( parsedURL );
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
