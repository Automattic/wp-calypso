import config from '@automattic/calypso-config';
import PropTypes from 'prop-types';
import Favicons from './favicons';

// Languages that use Recoleta for .wp-brand-font headings.
// Keep in sync with $langs in packages/typography/styles/fonts.scss.
export const RECOLETA_LANGS = [
	'af',
	'ca',
	'cs',
	'da',
	'de',
	'en',
	'es',
	'eu',
	'fi',
	'fr',
	'gl',
	'hr',
	'hu',
	'id',
	'is',
	'it',
	'lv',
	'mt',
	'nb',
	'nl',
	'pl',
	'pt',
	'ro',
	'ru',
	'sk',
	'sl',
	'sq',
	'sr',
	'sv',
	'sw',
	'tr',
	'uz',
];

const Head = ( {
	title = 'WordPress.com',
	children,
	branchName,
	inlineScriptNonce,
	faviconUrl,
	lang,
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

			<link
				rel="prefetch"
				as="document"
				href="https://public-api.wordpress.com/wp-admin/rest-proxy/?v=2.0"
			/>

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
			<link
				rel="preload"
				href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap"
				as="style"
			/>
			{ lang && RECOLETA_LANGS.some( ( code ) => lang.startsWith( code ) ) && (
				<link
					rel="preload"
					href="https://s1.wp.com/i/fonts/recoleta/extended/recoleta-400.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
			) }
			{ /* eslint-disable react/no-danger */ }
			<style
				nonce={ inlineScriptNonce }
				dangerouslySetInnerHTML={ {
					__html: `@font-face{font-display:swap;font-family:Recoleta;font-weight:400;src:url(https://s1.wp.com/i/fonts/recoleta/extended/recoleta-400.woff2) format("woff2"),url(https://s1.wp.com/i/fonts/recoleta/extended/recoleta-400.woff) format("woff")}`,
				} }
			/>
			{ /* eslint-enable react/no-danger */ }
			<noscript>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap"
				/>
			</noscript>
			{ /* eslint-disable react/no-danger */ }
			<script
				type="text/javascript"
				nonce={ inlineScriptNonce }
				dangerouslySetInnerHTML={ {
					// eslint-disable
					__html: `
			(function() {
				var m = document.createElement( "link" );
				m.rel = "stylesheet";
				m.href = "https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap";
				document.head.insertBefore( m, document.head.childNodes[ document.head.childNodes.length - 1 ].nextSibling );
			})()
			`,
				} }
			/>
			{ /* eslint-enable react/no-danger */ }
			{ children }
		</head>
	);
};

Head.propTypes = {
	title: PropTypes.string,
	children: PropTypes.node,
	branchName: PropTypes.string,
	faviconUrl: PropTypes.string,
	lang: PropTypes.string,
};

export default Head;
