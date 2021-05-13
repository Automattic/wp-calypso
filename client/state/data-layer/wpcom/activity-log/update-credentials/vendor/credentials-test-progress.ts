/** @format */

import { StreamResult as Progress } from './stream-result';
import { TransportError } from './transport-error';

// TS2322 + throw if we are missing a case
function exhaustive( x: never ): never {
	throw new Error( `Unknown enum variant: ${ x }` );
}

export class Parser {
	public updates: Array< Progress< Update, TransportError > > = [];
	public lastError: TransportError | null = null;
	public steps: Step[] = [
		{ label: 'check jetpack site', state: StepState.Waiting },
		{ label: 'check public host', state: StepState.Waiting },
		{ label: 'connect', state: StepState.Waiting },
		{ label: 'authenticate', state: StepState.Waiting },
		{ label: 'find wordpress', state: StepState.Waiting },
		{ label: 'save special paths', state: StepState.Waiting },
		{ label: 'disconnect', state: StepState.Waiting },
	];

	constructor( ...updates: Parser[ 'updates' ] ) {
		this.update( ...updates );
	}

	public update( ...updates: Parser[ 'updates' ] ) {
		for ( const maybeUpdate of updates ) {
			if ( maybeUpdate.isError ) {
				this.lastError = maybeUpdate.error!;
				for ( const step of this.steps ) {
					if ( step.state === StepState.Active ) {
						step.state = StepState.Bad;
					}
				}
			} else if ( maybeUpdate.value === true ) {
				for ( const step of this.steps ) {
					step.state = StepState.Good;
				}
			} else {
				const update = maybeUpdate.value!;
				switch ( update.kind ) {
					case UpdateKind.Attempt:
						for ( const step of this.steps ) {
							step.state = StepState.Waiting;
						}
						break;
					case UpdateKind.Status:
						for ( const step of this.steps ) {
							if ( step.label === update.label ) {
								switch ( update.state ) {
									case StatusState.Start:
										step.state = StepState.Active;
										break;
									case StatusState.Good:
										step.state = StepState.Good;
										break;
									case StatusState.Bad:
										step.state = StepState.Bad;
										break;
									default:
										exhaustive( update.state );
								}
							}
						}
						break;
					case UpdateKind.Debug:
						/* do nothing */
						break;
					default:
						exhaustive( update!.kind );
				}
			}
			this.updates.push( maybeUpdate );
		}
	}
}

export type Update = Attempt | Status | Debug | true;

export enum UpdateKind {
	Attempt = 'attempt',
	Status = 'status',
	Debug = 'debug',
}

export interface Step {
	label: string;
	state: StepState;
}

export enum StepState {
	Waiting = 'waiting',
	Active = 'active',
	Good = 'good',
	Bad = 'bad',
}

export interface Attempt {
	kind: UpdateKind.Attempt;
}

export interface Status {
	kind: UpdateKind.Status;
	label: string;
	state: StatusState;
}

export enum StatusState {
	Start = 'start',
	Good = 'good',
	Bad = 'bad',
}

export interface Debug {
	kind: UpdateKind.Debug;
	message: string;
}
