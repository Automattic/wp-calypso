/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import config from 'config';

class HeadBase extends React.Component {
	componentWillMount() {
		const { env } = this.props;

		this.faviconUrl = '//s1.wp.com/i/favicon.ico';

		if ( env === 'wpcalypso' ) {
			this.faviconUrl = '/calypso/images/favicons/favicon-wpcalypso.ico';
		}

		if ( env === 'horizon' ) {
			this.faviconUrl = '/calypso/images/favicons/favicon-horizon.ico';
		}

		if ( env === 'stage' ) {
			this.faviconUrl = '/calypso/images/favicons/favicon-staging.ico';
		}

		if ( env === 'development' ) {
			this.faviconUrl = '/calypso/images/favicons/favicon-development.ico';
		}
	}

	render() {
		return (
			<head>
				<title>{ this.props.title }</title>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<link rel="shortcut icon" type="image/vnd.microsoft.icon" href={ this.faviconUrl } sizes="16x16 32x32" />
				<link rel="shortcut icon" type="image/x-icon" href={ this.faviconUrl } sizes="16x16 32x32" />
				<link rel="icon" type="image/x-icon" href={ this.faviconUrl } sizes="16x16 32x32" />
				<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/favicon-64x64.png" sizes="64x64" />
				<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/android-chrome-192x192.png" sizes="192x192" />
				<link rel="apple-touch-icon" sizes="57x57" href="//s1.wp.com/i/favicons/apple-touch-icon-57x57.png" />
				<link rel="apple-touch-icon" sizes="60x60" href="//s1.wp.com/i/favicons/apple-touch-icon-60x60.png" />
				<link rel="apple-touch-icon" sizes="72x72" href="//s1.wp.com/i/favicons/apple-touch-icon-72x72.png" />
				<link rel="apple-touch-icon" sizes="76x76" href="//s1.wp.com/i/favicons/apple-touch-icon-76x76.png" />
				<link rel="apple-touch-icon" sizes="114x114" href="//s1.wp.com/i/favicons/apple-touch-icon-114x114.png" />
				<link rel="apple-touch-icon" sizes="120x120" href="//s1.wp.com/i/favicons/apple-touch-icon-120x120.png" />
				<link rel="apple-touch-icon" sizes="144x144" href="//s1.wp.com/i/favicons/apple-touch-icon-144x144.png" />
				<link rel="apple-touch-icon" sizes="152x152" href="//s1.wp.com/i/favicons/apple-touch-icon-152x152.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="//s1.wp.com/i/favicons/apple-touch-icon-180x180.png" />
				<link rel="profile" href="http://gmpg.org/xfn/11" />
				<link rel="stylesheet" href="//s1.wp.com/i/fonts/merriweather/merriweather.css?v=20160210" />
				<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
				<link rel="stylesheet" href="//s1.wp.com/wp-includes/css/dashicons.css?v=20150727" />
				<link rel="stylesheet" href={ this.props.stylesheetUrl } />
				{ this.props.children }
			</head>
		);
	}
}

export { HeadBase };

const Head = ( props ) => (
	<HeadBase { ...props } env={ config( 'env' ) } />
);

Head.defaultProps = {
	title: 'WordPress.com'
};

Head.propTypes = {
	title: PropTypes.string,
	stylesheetUrl: PropTypes.string.isRequired
};

export default Head;
