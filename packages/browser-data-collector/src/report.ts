import {
	deviceMemory,
	performanceTiming,
	environment,
	networkInformation,
	fullPageStart,
	inlineStart,
	pageVisibilityStart,
	pageVisibilityStop,
	blockingResources,
} from './collectors';
import type { Collector, Report, ReportData, ReportPayload } from './types';

export class ReportImpl implements Report {
	id: string;
	url: string;
	beginning!: number;
	end?: number;
	data: ReportData = new Map();
	startCollectors!: Collector[];
	stopCollectors!: Collector[];

	// Stubs that are necessary to implement but are not used.
	body = null;
	type = 'intervention';
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	toJSON() {}

	static async fromNow( id: string, collectors: Collector[] = [] ): Promise< Report > {
		const report = new ReportImpl( id, false );
		await report.start( collectors );
		return report;
	}

	static async fromPageStart( id: string, collectors: Collector[] = [] ): Promise< ReportImpl > {
		const report = new ReportImpl( id, true );
		await report.start( collectors );
		return report;
	}

	private constructor( id: string, isInitial: boolean ) {
		this.id = id;
		this.url = document.location.href;
		const commonStartCollectors = [ pageVisibilityStart ];
		const commonStopCollectors = [
			deviceMemory,
			environment,
			pageVisibilityStop,
			networkInformation,
		];

		if ( isInitial ) {
			this.startCollectors = [ fullPageStart, ...commonStartCollectors ];
			this.stopCollectors = [ performanceTiming, blockingResources, ...commonStopCollectors ];
		} else {
			this.startCollectors = [ inlineStart, ...commonStartCollectors ];
			this.stopCollectors = [ ...commonStopCollectors ];
		}
	}

	private async runCollectors( collectors: Collector[] ) {
		return Promise.all(
			collectors.map( ( collector, idx ) => {
				try {
					return collector( this );
				} catch ( err ) {
					// Swallow the error to make sure a single collector doesn't break the whole report
					// eslint-disable-next-line no-console
					console.warn( `Collector #${ idx } for report ${ this.id } failed to run`, err );
					return null;
				}
			} )
		);
	}

	private async start( collectors: Collector[] = [] ) {
		await this.runCollectors( [ ...this.startCollectors, ...collectors ] );
		return this;
	}

	async stop( collectors: Collector[] = [] ): Promise< ReportPayload > {
		this.end = Date.now();
		await this.runCollectors( [ ...this.stopCollectors, ...collectors ] );

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
