import config from '@automattic/calypso-config';
import bodyParser from 'body-parser';
import { snakeCase } from 'lodash';
import analytics from 'calypso/server/lib/analytics';

/**
 * Registers the CSP report route on the Express app
 * This route handles Content Security Policy violation reports sent by browsers.
 */
export function registerCspReportRoute( app ) {
	const calypsoEnv = config( 'env_id' );

	app.post(
		'/cspreport',
		bodyParser.json( { type: [ 'json', 'application/csp-report' ] } ),
		function ( req, res ) {
			const cspReport = req.body[ 'csp-report' ] || {};
			const cspReportSnakeCase = Object.keys( cspReport ).reduce( ( report, key ) => {
				report[ snakeCase( key ) ] = cspReport[ key ];
				return report;
			}, {} );

			if ( calypsoEnv !== 'development' ) {
				// Send to Tracks for analytics
				analytics.tracks.recordEvent( 'calypso_csp_report', cspReportSnakeCase, req );
			}

			// Send to Logstash for better logging/debugging
			analytics.logstash.log( {
				feature: 'calypso_client',
				message: 'CSP Violation Report',
				severity: 'info',
				properties: {
					env: calypsoEnv,
					...cspReportSnakeCase,
					user_agent: req.get( 'user-agent' ),
					referer: req.get( 'Referer' ),
				},
			} );

			res.status( 200 ).send( 'Got it!' );
		},
		// eslint-disable-next-line no-unused-vars
		function ( err, req, res, next ) {
			res.status( 500 ).send( 'Bad report!' );
		}
	);
}
