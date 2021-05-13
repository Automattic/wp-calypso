/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { get } from 'lodash';

/**
 * Try to preload image pixel via going through wp-admin login.
 * If SSO login pass-thru is enabled, you will be redirected to pixel
 */
function tryLogin( requestUrl, initalDelay, attempt ) {
	const image = new Image();

	if ( attempt < 9 ) {
		image.onerror = function () {
			setTimeout(
				tryLogin.bind( null, requestUrl, initalDelay, attempt + 1 ),
				initalDelay * attempt
			);
		};
	}
	image.src = requestUrl;
}

export default class WpadminAutoLogin extends Component {
	static propTypes = {
		site: PropTypes.object,
		delay: PropTypes.number,
	};

	static defaultProps = {
		delay: 3000,
	};

	componentDidMount() {
		const siteUrl = get( this.props.site, 'URL' );
		const requestUrl = this.getPixelUrl( siteUrl );

		setTimeout( tryLogin.bind( null, requestUrl, this.props.delay, 0 ), this.props.delay );
	}

	getPixelUrl( siteUrl ) {
		const pixel = encodeURI( `${ siteUrl }/wp-includes/images/blank.gif` );
		return `${ siteUrl }/wp-login.php?redirect_to=${ pixel }`;
	}

	render() {
		return null;
	}
}
