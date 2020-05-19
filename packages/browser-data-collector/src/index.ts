/**
 * Internal dependencies
 */
import { ReportImpl } from './report';
import { applyGlobalCollectors } from './collectors';

const inFlightReporters: Map< string, ReportImpl > = new Map();

export const start = ( key: string, { isInitial = false }: { isInitial?: boolean } = {} ) => {
	const existingReport = inFlightReporters.get( key );
	if ( existingReport ) {
		throw new Error( `A report with the same key '${ key }'is already in process.` );
	}
	const report = new ReportImpl( key );
	if ( isInitial ) {
		report.startFromPageLoad();
	} else {
		report.startFromNow();
	}
	inFlightReporters.set( key, report );
	return report;
};

export const stop = async ( key: string ): Promise< Report > => {
	const existingReport = inFlightReporters.get( key );
	if ( ! existingReport ) {
		throw new Error( `There is no in progress report with the key '${ key }'` );
	}
	await existingReport.stop();
	await applyGlobalCollectors( existingReport );
	return existingReport;
};

export const stopAndSend = async ( key: string ): Promise< boolean > => {
	await stop( key );
	return true;
};
