/**
 * Internal dependencies
 */
import { ReportImpl } from './report';
import { send } from './transports/logstash';

const inFlightReporters: Map< string, Promise< ReportImpl > > = new Map();

/**
 * Starts a new report
 *
 * @param id id of the report, must be passed to `stop()` to stop it
 * @param obj Options
 * @param obj.fullPageLoad `true` if the report should start measuring from the load of the page, `false` to start measuring from now.
 */
export const start = async (
	id: string,
	{ fullPageLoad = true }: { fullPageLoad?: boolean } = {}
) => {
	// There is a report in progress for this key, ignore this second call.
	if ( inFlightReporters.has( id ) ) return;

	inFlightReporters.set(
		id,
		fullPageLoad ? ReportImpl.fromPageStart( id ) : ReportImpl.fromNow( id )
	);
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

	// The report may be still starting, wait for it.
	const startedReport = await existingReport;

	const payload = await startedReport.stop();

	return send( payload );
};
