/**
 * Internal dependencies
 */
import { ReportImpl } from './report';
import { applyGlobalCollectors } from './collectors';
import { send } from './transports/logstash';

const inFlightReporters: Map< string, ReportImpl > = new Map();

export const start = ( key: string, { fullPageLoad = true }: { fullPageLoad?: boolean } = {} ) => {
	const existingReport = inFlightReporters.get( key );
	if ( existingReport ) {
		throw new Error( `A report with the same key '${ key }'is already in process.` );
	}
	const report = new ReportImpl( key, fullPageLoad );
	inFlightReporters.set( key, report );
	return report;
};

export const stop = async ( key: string ): Promise< Report > => {
	const existingReport = inFlightReporters.get( key );
	if ( ! existingReport ) {
		throw new Error( `There is no in progress report with the key '${ key }'` );
	}
	existingReport.stop();
	await applyGlobalCollectors( existingReport );
	return existingReport;
};

export const stopAndSend = async ( key: string ): Promise< boolean > => {
	const report = await stop( key );
	const payload = report.toJSON();
	return await send( payload );
};
