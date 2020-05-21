/**
 * Internal dependencies
 */
import { getNavigationStart } from './api/performance-timing';
import { deviceMemory, performanceTiming, environment } from './collectors';

export class ReportImpl implements Report {
	id: string;
	start!: number;
	end?: number;
	data: ReportData;
	collectors!: Collector[];

	constructor( id: string, isInitial: boolean ) {
		this.id = id;
		this.data = new Map();
		if ( isInitial ) {
			this.initializeFromFullPage();
		} else {
			this.initializeFromSPANavigation();
		}
	}

	private initializeFromFullPage() {
		this.start = getNavigationStart();
		this.data.set( 'fullPage', true );
		this.collectors = [ deviceMemory, performanceTiming, environment ];
	}

	private initializeFromSPANavigation() {
		this.start = Date.now();
		this.data.set( 'fullPage', false );
		this.collectors = [ deviceMemory, environment ];
	}

	async stop() {
		this.end = Date.now();
		await Promise.all( this.collectors.map( ( collector ) => collector( this ) ) );
		return this;
	}

	toJSON(): object {
		if ( this.end === undefined ) {
			throw new Error( "Can't serialize a report that has not been stopped" );
		}

		// Transform this.data Map into a regular object
		const data = Array.from( this.data.entries() ).reduce(
			( acc, [ k, v ] ) => ( { ...acc, [ k ]: v } ),
			{}
		);

		// Note `this.start` and `this.end` are timestamps, but here we serialize them
		// as 0 and an interaval.
		return {
			id: this.id,
			start: 0,
			end: this.end - this.start,
			...data,
		};
	}
}
