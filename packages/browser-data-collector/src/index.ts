import { ReportImpl } from './report';
import { send } from './transports/logstash';

const inFlightReporters: Map< string, Promise< Report > > = new Map();

/**
 * Starts a new report
 *
 * @param id id of the report, must be passed to `stop()` to stop it
 * @param obj Options
 * @param obj.fullPageLoad `true` if the report should start measuring from the load of the page, `false` to start measuring from now.
 * @param obj.collectors list of collectors to run
 */
export const start = async (
	id: string,
	{
		fullPageLoad = true,
		collectors = [],
	}: { fullPageLoad?: boolean; collectors?: Collector[] } = {}
): Promise< void > => {
	// There is a report in progress for this key, ignore this second call.
	if ( inFlightReporters.has( id ) ) {
		return;
	}

	const report = fullPageLoad
		? ReportImpl.fromPageStart( id, collectors )
		: ReportImpl.fromNow( id, collectors );
	inFlightReporters.set( id, report );
};

/**
 * Stops a report and sends it to the transporter.
 *
 * @param id id of the report to send, comes from `start()`
 * @param obj options
 * @param obj.collectors list of collectors to run
 * @returns `true` if the report was sent successfully, `false` otherwise
 */
export const stop = async (
	id: string,
	{ collectors = [] }: { collectors?: Collector[] } = {}
): Promise< boolean > => {
	const existingReport = inFlightReporters.get( id );

	// There is no in progress report with the key, fail silently to avoid messing with the rendering
	if ( ! existingReport ) {
		return false;
	}

	inFlightReporters.delete( id );

	// The report may be still starting, wait for it.
	const startedReport = await existingReport;

	const payload = await startedReport.stop( collectors );

	return send( payload );
};
