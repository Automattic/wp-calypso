/** @format */
/**
 * External dependencies
 */

import superagent from 'superagent';

/**
 * Internal dependencies
 */
import config from 'config';
import { statsdTimingUrl } from '../../../client/lib/analytics/statsd';
import { isUndefined, omit, assign } from 'lodash';
const URL = require( 'url' );

const analytics = {
	statsd: {
		recordTiming: function( featureSlug, eventType, duration ) {
			if ( config( 'server_side_boom_analytics_enabled' ) ) {
				const url = statsdTimingUrl( featureSlug, eventType, duration );
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
						_ui: req.query._ui,
						_ut: req.query._ut,
						_dl: req.get( 'Referer' ),
						_lg: acceptLanguageHeader.split( ',' )[ 0 ],
						_pf: req.useragent.platform,
						_via_ip: req.get( 'x-forwarded-for' ) || req.connection.remoteAddress,
						_via_ua: req.useragent.source,
					},
					eventProperties
				)
			);
		},
	},
};
export default analytics;
