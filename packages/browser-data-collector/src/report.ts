/**
 * Internal dependencies
 */
import {
	deviceMemory,
	performanceTiming,
	environment,
	networkInformation,
	fullPageStart,
	inlineStart,
	pageVisibilityStart,
	pageVisibilityStop,
} from './collectors';

export class ReportImpl implements Report {
	id: string;
	beginning!: number;
	end?: number;
	data: ReportData = new Map();
	startCollectors!: Collector[];
	stopCollectors!: Collector[];

	static async fromNow( id: string ) {
		const report = new ReportImpl( id, false );
		await report.start();
		return report;
	}

	static async fromPageStart( id: string ) {
		const report = new ReportImpl( id, true );
		await report.start();
		return report;
	}

	private constructor( id: string, isInitial: boolean ) {
		this.id = id;
		if ( isInitial ) {
			this.startCollectors = [ fullPageStart, pageVisibilityStart ];
			this.stopCollectors = [
				deviceMemory,
				performanceTiming,
				environment,
				pageVisibilityStop,
				networkInformation,
			];
		} else {
			this.startCollectors = [ inlineStart, pageVisibilityStart ];
			this.stopCollectors = [ deviceMemory, environment, pageVisibilityStop, networkInformation ];
		}
	}

	private async start() {
		await Promise.all( this.startCollectors.map( ( collector ) => collector( this ) ) );
		return this;
	}

	async stop() {
		this.end = Date.now();
		await Promise.all( this.stopCollectors.map( ( collector ) => collector( this ) ) );

		// Transform this.data Map into a regular object
		const data = Array.from( this.data.entries() ).reduce(
			( acc, [ k, v ] ) => ( { ...acc, [ k ]: v } ),
			{}
		);

		return {
			id: this.id,
			duration: this.end - this.beginning,
			...data,
		};
	}
}
