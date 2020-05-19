/**
 * Internal dependencies
 */
import { getNavigationStart } from './api/performance-timing';

export class ReportImpl implements Report {
	name: string;
	start: number;
	end?: number;
	duration?: number;
	data: ReportData;

	constructor( name: string, isInitial: boolean ) {
		this.name = name;
		this.data = new Map();
		if ( isInitial ) {
			this.start = getNavigationStart();
			this.data.set( 'fullPage', true );
		} else {
			this.start = Date.now();
			this.data.set( 'fullPage', false );
		}
	}

	stop() {
		if ( this.start === undefined ) {
			throw new Error( "Can't stop a report that has not been started" );
		}
		this.end = Date.now();
		this.duration = this.end - this.start;
		return this;
	}

	toJSON(): object {
		// Transform this.data Map into a regular object
		const data = Array.from( this.data.entries() ).reduce(
			( acc, [ k, v ] ) => ( { ...acc, [ k ]: v } ),
			{}
		);
		return {
			start: 0,
			end: this.duration,
			...data,
		};
	}
}
