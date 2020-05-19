/**
 * Internal dependencies
 */
import { getNavigationStart } from './api/performance-timing';
import { now } from './api/high-resolution-time';

export class ReportImpl implements Report {
	name: string;
	start?: number;
	end?: number;
	duration?: number;
	data: ReportData;

	constructor( name: string ) {
		this.name = name;
		this.data = new Map();
	}

	startFromNow() {
		this.start = now();
		this.data.set( 'fullPage', false );
	}

	startFromPageLoad() {
		this.start = getNavigationStart();
		this.data.set( 'fullPage', true );
	}

	async stop(): Promise< Report > {
		if ( this.start === undefined ) {
			throw new Error( "Can't stop a report that has not been started" );
		}
		this.end = now();
		this.duration = this.end - this.start;
		return this;
	}

	toJSON(): object {
		return {
			start: this.start,
			end: this.end,
			duration: this.duration,
			...this.data,
		};
	}
}
