import PropTypes from 'prop-types';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const wordPressFavicons = () => {
	const cdn = '//s1.wp.com';

	return (
		<>
			<link
				rel="icon"
				type="image/png"
				href={ `${ cdn }/i/favicons/favicon-64x64.png` }
				sizes="64x64"
			/>
			<link
				rel="icon"
				type="image/png"
				href={ `${ cdn }/i/favicons/favicon-96x96.png` }
				sizes="96x96"
			/>
			<link
				rel="icon"
				type="image/png"
				href={ `${ cdn }/i/favicons/android-chrome-192x192.png` }
				sizes="192x192"
			/>
			{ [ 180, 152, 144, 120, 114, 76, 72, 60, 57 ].map( ( size ) => (
				<link
					key={ size }
					rel="apple-touch-icon"
					type="image/png"
					sizes={ `${ size }x${ size }` }
					href={ `${ cdn }/i/favicons/apple-touch-icon-${ size }x${ size }.png` }
				/>
			) ) }
		</>
	);
};

const jetpackFavicons = () => (
	<>
		<link
			rel="mask-icon"
			type="image/svg+xml"
			href="/calypso/images/jetpack/favicons/safari-pinned-tab.svg"
			color="#00be28"
		/>
		<meta name="application-name" content="Jetpack.com" />
		<meta
			name="msapplication-config"
			content="/calypso/images/jetpack/favicons/browserconfig.xml"
		/>
		<link
			rel="icon"
			type="image/png"
			sizes="512x512"
			href="/calypso/images/jetpack/favicons/android-chrome-512x512.png"
		/>
		<link
			rel="icon"
			type="image/png"
			sizes="192x192"
			href="/calypso/images/jetpack/favicons/android-chrome-192x192.png"
		/>
		<link
			rel="apple-touch-icon"
			type="image/png"
			sizes="180x180"
			href="/calypso/images/jetpack/favicons/apple-touch-icon.png"
		/>
	</>
);

const a4aFavicons = () => (
	<>
		<meta name="application-name" content="Automattic for Agencies" />
		<link
			rel="icon"
			type="image/png"
			sizes="16x16"
			href="/calypso/images/a8c-for-agencies/favicons/favicon-16x16.png"
		/>
		<link
			rel="icon"
			type="image/png"
			sizes="32x32"
			href="/calypso/images/a8c-for-agencies/favicons/favicon-32x32.png"
		/>
		<link
			rel="icon"
			type="image/png"
			sizes="48x48"
			href="/calypso/images/a8c-for-agencies/favicons/favicon-48x48.png"
		/>
		<link
			rel="icon"
			type="image/png"
			sizes="192x192"
			href="/calypso/images/a8c-for-agencies/favicons/android-chrome-192x192.png"
		/>
		<link
			rel="icon"
			type="image/png"
			sizes="512x512"
			href="/calypso/images/a8c-for-agencies/favicons/android-chrome-512x512.png"
		/>
		<link
			rel="apple-touch-icon"
			type="image/png"
			sizes="180x180"
			href="/calypso/images/a8c-for-agencies/favicons/apple-touch-icon.png"
		/>
	</>
);

const Favicons = ( { environmentFaviconURL } ) => {
	let favicons = wordPressFavicons;

	if ( isA8CForAgencies() ) {
		favicons = a4aFavicons;
	} else if ( isJetpackCloud() ) {
		favicons = jetpackFavicons;
	}

	return (
		<>
			<link
				rel="shortcut icon"
				type="image/vnd.microsoft.icon"
				href={ environmentFaviconURL }
				sizes="16x16 32x32"
			/>
			<link
				rel="shortcut icon"
				type="image/x-icon"
				href={ environmentFaviconURL }
				sizes="16x16 32x32"
			/>
			<link rel="icon" type="image/x-icon" href={ environmentFaviconURL } sizes="16x16 32x32" />

			{ favicons() }
		</>
	);
};

Favicons.propTypes = {
	environmentFaviconURL: PropTypes.string.isRequired,
};

export default Favicons;
