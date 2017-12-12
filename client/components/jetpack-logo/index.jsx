/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Module constants
 */
const logoPathSize32 = (
	<path
		className="jetpack-logo__icon"
		d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16c8.8,0,16-7.2,16-16S24.8,0,16,0z M15.2,18.7h-8l8-15.5V18.7z M16.8,28.8 V13.3h8L16.8,28.8z"
	/> // eslint-disable-line max-len
);
const svgLogo24 = (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<svg className="jetpack-logo" height="24" width="24" viewBox="0 0 24 24">
		{
			// eslint-disable-next-line max-len
			<path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M11,14H6l5-10V14z M13,20V10h5L13,20z" />
		}
	</svg>
);

const JetpackLogo = ( { size = 32, full } ) => {
	if ( full === true ) {
		return (
			<svg height={ size } className="jetpack-logo" viewBox="0 0 118 32">
				<title>Jetpack</title>
				{ logoPathSize32 }
				{
					// eslint-disable-next-line max-len
					<path d="M41.3 26.6c-.5-.7-.9-1.4-1.3-2.1 2.3-1.4 3-2.5 3-4.6V8h-3V6h6v13.4C46 22.8 45 24.8 41.3 26.6zM58.5 21.3c-1.5.5-2.7.6-4.2.6-3.6 0-5.8-1.8-5.8-6 0-3.1 1.9-5.9 5.5-5.9s4.9 2.5 4.9 4.9c0 .8 0 1.5-.1 2h-7.3c.1 2.5 1.5 2.8 3.6 2.8 1.1 0 2.2-.3 3.4-.7C58.5 19 58.5 21.3 58.5 21.3zM56 15c0-1.4-.5-2.9-2-2.9-1.4 0-2.3 1.3-2.4 2.9C51.6 15 56 15 56 15zM65 18.4c0 1.1.8 1.3 1.4 1.3.5 0 2-.2 2.6-.4v2.1c-.9.3-2.5.5-3.7.5-1.5 0-3.2-.5-3.2-3.1V12H60v-2h2.1V7.1H65V10h4v2h-4V18.4zM71 10h3v1.3c1.1-.8 1.9-1.3 3.3-1.3 2.5 0 4.5 1.8 4.5 5.6s-2.2 6.3-5.8 6.3c-.9 0-1.3-.1-2-.3V28h-3V10zM76.5 12.3c-.8 0-1.6.4-2.5 1.2v5.9c.6.1.9.2 1.8.2 2 0 3.2-1.3 3.2-3.9C79 13.4 78.1 12.3 76.5 12.3zM93 22h-3v-1.5c-.9.7-1.9 1.5-3.5 1.5-1.5 0-3.1-1.1-3.1-3.2 0-2.9 2.5-3.4 4.2-3.7l2.4-.3v-.3c0-1.5-.5-2.3-2-2.3-.7 0-2.3.5-3.7 1.1L84 11c1.2-.4 3-1 4.4-1 2.7 0 4.6 1.4 4.6 4.7L93 22zM90 16.4l-2.2.4c-.7.1-1.4.5-1.4 1.6 0 .9.5 1.4 1.3 1.4s1.5-.5 2.3-1V16.4zM104.5 21.3c-1.1.4-2.2.6-3.5.6-4.2 0-5.9-2.4-5.9-5.9 0-3.7 2.3-6 6.1-6 1.4 0 2.3.2 3.2.5V13c-.8-.3-2-.6-3.2-.6-1.7 0-3.2.9-3.2 3.6 0 2.9 1.5 3.8 3.3 3.8.9 0 1.9-.2 3.2-.7V21.3zM110 15.2c.2-.3.2-.8 3.8-5.2h3.7l-4.6 5.7 5 6.3h-3.7l-4.2-5.8V22h-3V6h3V15.2z" />
				}
			</svg>
		);
	}

	if ( 24 === size ) {
		return svgLogo24;
	}

	return (
		<svg className="jetpack-logo" height={ size } width={ size } viewBox="0 0 32 32">
			{ logoPathSize32 }
		</svg>
	);
};
export default JetpackLogo;
