import config from '@automattic/calypso-config';
import PropTypes from 'prop-types';
import Favicons from './favicons';

const Head = ( {
	title = 'WordPress.com',
	children,
	branchName,
	faviconUrl,
	shouldPrefetchRestProxy = true,
} ) => {
	return (
		<head>
			<title>{ title }</title>

			<meta charSet="utf-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			<meta name="format-detection" content="telephone=no" />
			<meta name="mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="theme-color" content={ config( 'theme_color' ) } />
			<meta name="referrer" content="origin" />

			{ shouldPrefetchRestProxy && (
				<link
					rel="prefetch"
					as="document"
					href="https://public-api.wordpress.com/wp-admin/rest-proxy/?v=2.0"
				/>
			) }

			<Favicons environmentFaviconURL={ faviconUrl || config( 'favicon_url' ) } />

			<link rel="profile" href="http://gmpg.org/xfn/11" />

			{ ! branchName || 'trunk' === branchName ? (
				<link rel="manifest" href="/calypso/manifest.json" />
			) : (
				<link
					rel="manifest"
					href={ '/calypso/manifest.json?branch=' + encodeURIComponent( branchName ) }
				/>
			) }
			{ children }
		</head>
	);
};

Head.propTypes = {
	title: PropTypes.string,
	children: PropTypes.node,
	branchName: PropTypes.string,
	faviconUrl: PropTypes.string,
	shouldPrefetchRestProxy: PropTypes.bool,
};

export default Head;
