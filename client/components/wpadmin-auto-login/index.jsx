/**
 * External Dependencies
 */
import { Component, PropTypes } from 'react';
import { get } from 'lodash';

export default class WpadminAutoLogin extends Component {

	static propTypes = {
		site: PropTypes.object,
		delay: PropTypes.number,
	}

	state = {
		timeout: null,
		retries: 10,
	};

	static defaultProps = {
		delay: 3000,
	};

	constructor( props ) {
		super( props );
		this.onerror = this.onerror.bind( this );
		this.requestLogin = this.requestLogin.bind( this );
	}

	componentWillMount() {
		this.state.timeout = setTimeout( this.requestLogin, this.props.delay );
	}

	getPixelUrl( siteUrl ) {
		const pixel = encodeURI( siteUrl + '/wp-includes/images/blank.gif' );
		return `${ siteUrl }/wp-login.php?redirect_to=${ pixel }`;
	}

	/**
	 * If we encounter an error, try again.
	 * We may want to retry since just post-transfer there are certificate issues.
	 */
	onerror() {
		if ( this.state.retries > 0 ) {
			this.state.timeout = setTimeout( this.requestLogin, this.props.delay );
		}
	}

	/**
	 * Try to preload image pixel via going through wp-admin login.
	 * If SSO login pass-thru is enabled, you will be redirected to pixel
	 */
	requestLogin() {
		this.setState( { retries: this.state.retries - 1 } );
		const siteUrl = get( this.props.site, 'URL' );
		const requestUrl = this.getPixelUrl( siteUrl );

		this.image = new Image();
		this.image.src = requestUrl;
		this.image.onerror = this.onerror;
	}

	render() {
		return null;
	}
};
