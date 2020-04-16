/**
 * External dependencies
 */

import superagent from 'superagent';
import { v4 as uuid } from 'uuid';
import { isUndefined, omit, assign, get, has } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { statsdTimingUrl, statsdCountingUrl } from 'lib/analytics/statsd-utils';
const URL = require( 'url' );

function getUserFromRequest( request ) {
	// if user has a cookie, lets use that
	const encodedUserCookie = get( request, 'cookies.wordpress_logged_in', null );

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
	if ( has( request, 'query._ut' ) && has( request, 'query._ui' ) ) {
		return {
			_ui: request.query._ui,
			_ut: request.query._ut,
		};
	}

	// We didn't get a full identity, create an anon ID
	return {
		_ut: 'anon',
		_ui: uuid(),
	};
}

const analytics = {
	statsd: {
		recordTiming: function( featureSlug, eventType, duration ) {
			if ( config( 'server_side_boom_analytics_enabled' ) ) {
				const url = statsdTimingUrl( featureSlug, eventType, duration );
				superagent.get( url ).end();
			}
		},

		recordCounting: function( featureSlug, eventType, increment = 1 ) {
			if ( config( 'server_side_boom_analytics_enabled' ) ) {
				const url = statsdCountingUrl( featureSlug, eventType, increment );
				superagent.get( url ).end();
			}
		},
	},

	tracks: {
		createPixel: function( data ) {
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

		recordEvent: function( eventName, eventProperties, req ) {
			eventProperties = eventProperties || {};

			if ( eventName.indexOf( 'calypso_' ) !== 0 ) {
				console.warn( '- Event name must be prefixed by "calypso_"' );
				return;
			}

			// Remove properties that have an undefined value
			// This allows a caller to easily remove properties from the recorded set by setting them to undefined
			eventProperties = omit( eventProperties, isUndefined );

			const date = new Date();
			const acceptLanguageHeader = req.get( 'Accept-Language' ) || '';

			this.createPixel(
				assign(
					{
						_en: eventName,
						_ts: date.getTime(),
						_tz: date.getTimezoneOffset() / 60,
						_dl: req.get( 'Referer' ),
						_lg: acceptLanguageHeader.split( ',' )[ 0 ],
						_pf: req.useragent.platform,
						_via_ip: req.get( 'x-forwarded-for' ) || req.connection.remoteAddress,
						_via_ua: req.useragent.source,
					},
					getUserFromRequest( req ),
					eventProperties
				)
			);
		},
	},
};
export default analytics;
