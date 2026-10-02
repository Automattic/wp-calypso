import {
	actionFailureMessage,
	validateAppliedResponse,
	validateComponentResult,
} from './validation';
import type { ComponentActionRequest, ComponentResult } from './types';

export interface ComponentSessionMessages {
	presentationFailure: string;
	unverifiedOutcome: string;
	expired: string;
	continuationFailure: string;
}

const defaultMessages: ComponentSessionMessages = {
	presentationFailure:
		'This confirmation could not be displayed. Check the site before requesting another proposal.',
	unverifiedOutcome:
		'The action outcome could not be verified. Check the site before requesting another proposal.',
	expired: 'This action expired. Request a new proposal.',
	continuationFailure:
		'The action completed, but the agent could not continue. Check the completed result above.',
};

export interface ComponentSessionOptions {
	result: ComponentResult;
	transport: ( request: ComponentActionRequest ) => Promise< unknown >;
	onContinue: ( summary: string ) => Promise< void >;
	locale?: string;
	createRequestId?: () => string;
	messages?: ComponentSessionMessages;
	onExpire?: () => void;
}

export interface ComponentSessionSnapshot {
	result: ComponentResult | null;
	phase: 'ready' | 'pending' | 'completed' | 'failed';
	error: string | null;
}

export class ComponentSession {
	private snapshot: ComponentSessionSnapshot;
	private listeners = new Set< () => void >();
	private consumed = false;
	private presentationFailed = false;
	private disposed = false;
	private expiresAt = Date.now() + 60 * 60 * 1000;
	private expiryTimer: ReturnType< typeof setTimeout > | undefined;
	private transport: ComponentSessionOptions[ 'transport' ];
	private onContinue: ComponentSessionOptions[ 'onContinue' ];
	private createRequestId: ComponentSessionOptions[ 'createRequestId' ];
	private onExpire: ComponentSessionOptions[ 'onExpire' ];
	private locale: string | undefined;
	private messages: ComponentSessionMessages;

	constructor( options: ComponentSessionOptions ) {
		const result = validateComponentResult( options.result );
		if ( ! result ) {
			throw new Error( 'This confirmation could not be displayed.' );
		}
		this.snapshot = {
			result: JSON.parse( JSON.stringify( result ) ),
			phase: result.status === 'completed' ? 'completed' : 'ready',
			error: null,
		};
		this.consumed = result.status === 'completed';
		this.transport = options.transport;
		this.onContinue = options.onContinue;
		this.createRequestId = options.createRequestId;
		this.onExpire = options.onExpire;
		this.locale = options.locale;
		this.messages = options.messages ?? defaultMessages;
		this.scheduleExpiry();
	}

	getSnapshot = (): ComponentSessionSnapshot => this.snapshot;

	updateLocale = ( locale?: string ) => {
		this.locale = locale;
	};

	updateMessages = ( messages: ComponentSessionMessages = defaultMessages ) => {
		const names = Object.keys( defaultMessages ) as Array< keyof ComponentSessionMessages >;
		if ( this.disposed || names.every( ( name ) => messages[ name ] === this.messages[ name ] ) ) {
			return;
		}
		const error = names.find( ( name ) => this.messages[ name ] === this.snapshot.error );
		this.messages = messages;
		this.update( { ...this.snapshot, error: error ? messages[ error ] : this.snapshot.error } );
	};

	subscribe = ( listener: () => void ): ( () => void ) => {
		if ( this.disposed ) {
			return () => {};
		}
		this.listeners.add( listener );
		return () => this.listeners.delete( listener );
	};

	private update( snapshot: ComponentSessionSnapshot ) {
		this.snapshot = snapshot;
		for ( const listener of this.listeners ) {
			try {
				listener();
			} catch {
				this.presentationFailed = true;
				this.snapshot = {
					...this.snapshot,
					phase: this.snapshot.result?.status === 'completed' ? 'completed' : 'failed',
					error: this.messages.presentationFailure,
				};
			}
		}
	}

	private scheduleExpiry() {
		clearTimeout( this.expiryTimer );
		if ( this.expiresAt <= Date.now() ) {
			this.expire();
		} else {
			this.expiryTimer = setTimeout( () => this.expire(), this.expiresAt - Date.now() );
		}
	}

	private expire() {
		if ( this.disposed || ! this.snapshot.result ) {
			return;
		}
		this.consumed = true;
		clearTimeout( this.expiryTimer );
		this.update( { result: null, phase: 'failed', error: this.messages.expired } );
		this.onExpire?.();
	}

	dispose = () => {
		if ( this.disposed ) {
			return;
		}
		this.disposed = true;
		this.consumed = true;
		clearTimeout( this.expiryTimer );
		this.update( { result: null, phase: 'failed', error: null } );
		this.listeners.clear();
	};

	failPresentation = () => {
		if ( this.disposed || ! this.snapshot.result ) {
			return;
		}
		this.consumed = true;
		this.presentationFailed = true;
		this.update( {
			...this.snapshot,
			phase: this.snapshot.result?.status === 'completed' ? 'completed' : 'failed',
			error: this.messages.presentationFailure,
		} );
	};

	submit = async ( action: string ): Promise< void > => {
		if ( this.disposed || this.consumed || this.snapshot.phase !== 'ready' ) {
			return;
		}
		if ( this.expiresAt <= Date.now() ) {
			this.expire();
			return;
		}
		const opening = this.snapshot.result;
		if ( ! opening ) {
			return;
		}
		const button = Object.values( opening.surface.components ).find(
			( component ) => component.type === 'Button' && component.action === action
		);
		if ( ! button ) {
			return;
		}
		this.consumed = true;
		this.update( { ...this.snapshot, phase: 'pending', error: null } );
		if ( this.disposed || ! this.snapshot.result ) {
			return;
		}
		try {
			const request: ComponentActionRequest = {
				protocol: 'agent-component/0.1',
				instanceId: opening.instanceId,
				expectedRevision: opening.revision,
				requestId: this.createRequestId?.() ?? globalThis.crypto.randomUUID(),
				...( this.locale ? { locale: this.locale } : {} ),
				event: { name: action, values: {} },
			};
			if (
				typeof request.requestId !== 'string' ||
				request.requestId.length > 128 ||
				! /^[a-zA-Z0-9_.:-]+$/.test( request.requestId )
			) {
				throw new Error( 'Invalid request identifier.' );
			}
			const response = await this.transport( request );
			if ( this.disposed || ! this.snapshot.result ) {
				return;
			}
			if ( this.expiresAt <= Date.now() ) {
				this.expire();
				return;
			}
			const replacement = validateAppliedResponse( response, request, opening );
			if ( ! replacement ) {
				this.update( {
					...this.snapshot,
					phase: 'failed',
					error: actionFailureMessage( response, request ) ?? this.messages.unverifiedOutcome,
				} );
				return;
			}
			this.expiresAt = Math.min( this.expiresAt, Date.parse( replacement.expiresAt ) );
			this.update( {
				result: JSON.parse( JSON.stringify( replacement.result ) ),
				phase: 'completed',
				error: this.presentationFailed ? this.snapshot.error : null,
			} );
			if ( this.disposed || ! this.snapshot.result ) {
				return;
			}
			this.scheduleExpiry();
			if ( ! this.snapshot.result ) {
				return;
			}
			try {
				await this.onContinue( replacement.result.summary );
			} catch {
				if ( ! this.disposed && this.snapshot.result ) {
					this.update( { ...this.snapshot, error: this.messages.continuationFailure } );
				}
			}
		} catch {
			if ( ! this.disposed && this.snapshot.result && ! this.presentationFailed ) {
				this.update( {
					...this.snapshot,
					phase: 'failed',
					error: this.messages.unverifiedOutcome,
				} );
			}
		}
	};
}
