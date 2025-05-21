import crypto from 'crypto';
import { type Request } from 'express';
import superagent from 'superagent';
const URL = require( 'url' );

interface UserParameters {
	_ul?: string;
	_ui: string | number;
	_ut: string;
}

function getUserFromRequest( request: Request ): UserParameters {
	// if user has a cookie, lets use that
	const encodedUserCookie = request?.cookies?.wordpress_logged_in ?? null;

	if ( encodedUserCookie ) {
		try {
			const userCookieParts = decodeURIComponent( encodedUserCookie ).split( '|' );

			// We don't trust it, but for analytics this is enough
			return {
				_ul: userCookieParts[ 0 ],
				_ui: parseInt( userCookieParts[ 1 ], 10 ),
				_ut: 'wpcom:user_id',
			};
		} catch ( ex ) {
			// ignore the error and let it fallback to anonymous below
		}
	}

	// if user doesn't have a cookie, and we had the user identification passed to us on query params
	// we'll use that, otherwise, we'll just use anonymous.

	// If we have a full identity on query params - use it
	if ( request?.query?._ut && request?.query?._ui ) {
		return {
			_ui: request.query._ui as string,
			_ut: request.query._ut as string,
		};
	}

	// We didn't get a full identity, create an anon ID
	return {
		_ut: 'anon',
		_ui: crypto.randomUUID(),
	};
}

const analytics = {
	tracks: {
		createPixel: function ( data: Record< string, string | number | undefined > ) {
			data._rt = new Date().getTime();
			data._ = '_';
			const pixelUrl = URL.format( {
				protocol: 'http',
				host: 'pixel.wp.com',
				pathname: '/t.gif',
				query: data,
			} );
			superagent.get( pixelUrl ).end();
		},

		recordEvent: function (
			eventName: string,
			eventProperties: Record< string, string | undefined >,
			req: Request
		) {
			eventProperties = eventProperties || {};

			if ( eventName.indexOf( 'calypso_' ) !== 0 ) {
				console.warn( '- Event name must be prefixed by "calypso_"' );
				return;
			}

			// Remove properties that have an undefined value
			// This allows a caller to easily remove properties from the recorded set by setting them to undefined
			eventProperties = Object.fromEntries(
				Object.entries( eventProperties ).filter( ( entry ) => entry[ 1 ] !== undefined )
			);

			const date = new Date();
			const acceptLanguageHeader = req.get( 'Accept-Language' ) || '';

			this.createPixel( {
				_en: eventName,
				_ts: date.getTime(),
				_dl: req.get( 'Referer' ),
				_lg: acceptLanguageHeader.split( ',' )[ 0 ],
				_via_ip: req.get( 'x-forwarded-for' ) || req.connection.remoteAddress,
				_via_ua: req.get( 'user-agent' ),
				...getUserFromRequest( req ),
				...eventProperties,
			} );
		},
	},
};
export default analytics;
