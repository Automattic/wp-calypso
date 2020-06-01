/**
 * Internal dependencies
 */
import { ReportImpl } from './report';
import { send } from './transports/logstash';
import { shouldSend } from './should-send';

const inFlightReporters: Map< string, ReportImpl > = new Map();

/**
 * Starts a new report
 *
 * @param id id of the report, must be passed to `stop()` to stop it
 * @param obj Options
 * @param obj.fullPageLoad `true` if the report should start measuring from the load of the page, `false` to start measuring from now.
 */
export const start = ( id: string, { fullPageLoad = true }: { fullPageLoad?: boolean } = {} ) => {
	const existingReport = inFlightReporters.get( id );

	// There is a report in progress. Probably the user clicked twice.
	if ( existingReport ) return;

	if ( existingReport ) {
		throw new Error( `A report with the same key '${ id }'is already in process.` );
	}

	const report = new ReportImpl( id, fullPageLoad );
	inFlightReporters.set( id, report );
};

/**
 * Stops a report and sends it to the transporter.
 *
 * @param id id of the report to send, comes from `start()`
 * @returns `true` if the report was sent successfully, `false` otherwise
 */
export const stop = async ( id: string ): Promise< boolean > => {
	const existingReport = inFlightReporters.get( id );

	// There is no in progress report with the key, fail silently to avoid messing with the rendering
	if ( ! existingReport ) return false;

	inFlightReporters.delete( id );

	await existingReport.stop();

	if ( shouldSend( existingReport ) ) {
		return send( existingReport.toJSON() );
	}
	return false;
};
