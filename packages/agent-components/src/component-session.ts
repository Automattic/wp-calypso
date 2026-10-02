import {
	validateActionEvent,
	validateActionResponse,
	validateComponentOpening,
	validateComponentResult,
	validateLegacyButtonAction,
} from './validation';
import { locale as validLocale } from './validation-utils';
import type { ActionEvent, ComponentActionRequest, ComponentResult } from './types';

export interface ComponentSessionMessages {
	presentationFailure: string;
	invalidInput: string;
	unverifiedOutcome: string;
	expired: string;
	continuationFailure: string;
}

export interface ComponentSessionOptions {
	result: ComponentResult;
	allowedActions?: readonly string[];
	actionBindings?: Readonly< Record< string, readonly string[] > >;
	expiresAt?: string;
	transport: ( request: ComponentActionRequest ) => Promise< unknown >;
	onContinue: ( summary: string ) => Promise< void >;
	locale?: string;
	createRequestId?: () => string;
	messages?: ComponentSessionMessages;
	presentationFailed?: boolean;
	onExpire?: () => void;
}

export interface ComponentSessionSnapshot {
	result: ComponentResult | null;
	phase: 'ready' | 'pending' | 'completed' | 'failed';
	error: string | null;
	allowedActions: ReadonlySet< string >;
	actionBindings: Readonly< Record< string, readonly string[] > >;
}

const defaultMessages: ComponentSessionMessages = {
	presentationFailure:
		'This confirmation could not be displayed. Check the site before requesting another proposal.',
	invalidInput: 'Check the form values and try again.',
	unverifiedOutcome:
		'The action outcome could not be verified. Check the site before requesting another proposal.',
	expired: 'This action expired. Request a new proposal.',
	continuationFailure:
		'The action completed, but the agent could not continue. Check the completed result above.',
};

export class ComponentSession {
	private snapshot: ComponentSessionSnapshot;
	private listeners = new Set< () => void >();
	private consumed = false;
	private presentationFailed = false;
	private disposed = false;
	private sequence = 0;
	private expiresAt: number;
	private expiryTimer: ReturnType< typeof setTimeout > | undefined;
	private readonly transport: ComponentSessionOptions[ 'transport' ];
	private readonly onContinue: ComponentSessionOptions[ 'onContinue' ];
	private readonly createRequestId: ComponentSessionOptions[ 'createRequestId' ];
	private locale: string | undefined;
	private messages: ComponentSessionMessages;
	private readonly onExpire: ComponentSessionOptions[ 'onExpire' ];

	constructor( options: ComponentSessionOptions ) {
		const result = validateComponentResult( options.result );
		const hasMetadata =
			options.allowedActions !== undefined ||
			options.actionBindings !== undefined ||
			options.expiresAt !== undefined;
		const opening = hasMetadata
			? validateComponentOpening( {
					protocol: 'agent-component/0.1',
					result,
					allowedActions: options.allowedActions,
					actionBindings: options.actionBindings,
					expiresAt: options.expiresAt,
				} )
			: null;
		const legacy = ! hasMetadata ? validateLegacyButtonAction( result ) : null;
		if ( ! result || ( ! opening && ! legacy ) ) {
			throw new Error( 'This confirmation could not be displayed.' );
		}
		const allowedActions =
			opening?.allowedActions ??
			( result.status === 'awaiting-input'
				? Object.values( result.surface.components ).flatMap( ( component ) =>
						component.type === 'Button' && ! component.disabled && ! component.loading
							? [ component.action ]
							: []
					)
				: [] );
		const actionBindings =
			opening?.actionBindings ??
			Object.fromEntries( allowedActions.map( ( name ) => [ name, [] ] ) );
		this.snapshot = {
			result: JSON.parse( JSON.stringify( result ) ),
			phase: result.status === 'completed' ? 'completed' : 'ready',
			error: null,
			allowedActions: new Set( allowedActions ),
			actionBindings: JSON.parse( JSON.stringify( actionBindings ) ),
		};
		this.transport = options.transport;
		this.onContinue = options.onContinue;
		this.createRequestId = options.createRequestId;
		this.updateLocale( options.locale );
		this.messages = options.messages ?? defaultMessages;
		this.onExpire = options.onExpire;
		this.consumed = result.status === 'completed';
		this.expiresAt = Math.min(
			opening ? Date.parse( opening.expiresAt ) : Infinity,
			Date.now() + 60 * 60 * 1000
		);
		this.scheduleExpiry();
		if ( options.presentationFailed ) {
			this.failPresentation();
		}
	}

	getSnapshot = (): ComponentSessionSnapshot => this.snapshot;

	updateLocale = ( locale?: string ) => {
		if (
			! this.disposed &&
			locale !== this.locale &&
			( locale === undefined || validLocale( locale ) )
		) {
			this.locale = locale;
			this.update( { ...this.snapshot } );
		}
	};

	updateMessages = ( messages: ComponentSessionMessages = defaultMessages ) => {
		const names = Object.keys( defaultMessages ) as Array< keyof ComponentSessionMessages >;
		if ( this.disposed || names.every( ( name ) => messages[ name ] === this.messages[ name ] ) ) {
			return;
		}
		const error = names.find( ( name ) => this.messages[ name ] === this.snapshot.error );
		this.messages = messages;
		this.update( {
			...this.snapshot,
			error: error ? messages[ error ] : this.snapshot.error,
		} );
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
					allowedActions: new Set(),
					actionBindings: {},
					error: this.messages.presentationFailure,
				};
			}
		}
	}

	private scheduleExpiry() {
		clearTimeout( this.expiryTimer );
		if ( this.disposed ) {
			return;
		}
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
		this.sequence++;
		this.consumed = true;
		clearTimeout( this.expiryTimer );
		this.update( {
			result: null,
			phase: 'failed',
			error: this.messages.expired,
			allowedActions: new Set(),
			actionBindings: {},
		} );
		try {
			this.onExpire?.();
		} catch {
			this.presentationFailed = true;
		}
	}

	dispose = () => {
		if ( this.disposed ) {
			return;
		}
		this.disposed = true;
		this.sequence++;
		this.consumed = true;
		clearTimeout( this.expiryTimer );
		this.update( {
			result: null,
			phase: 'failed',
			error: null,
			allowedActions: new Set(),
			actionBindings: {},
		} );
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
			phase: this.snapshot.result.status === 'completed' ? 'completed' : 'failed',
			allowedActions: new Set(),
			actionBindings: {},
			error: this.messages.presentationFailure,
		} );
	};

	submit = async ( action: ActionEvent | string ): Promise< void > => {
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
		const event = validateActionEvent(
			typeof action === 'string' ? { name: action, values: {} } : action,
			opening.surface,
			this.snapshot.allowedActions,
			this.snapshot.actionBindings
		);
		if ( ! event ) {
			this.update( { ...this.snapshot, error: this.messages.invalidInput } );
			return;
		}
		this.consumed = true;
		const sequence = ++this.sequence;
		this.update( {
			...this.snapshot,
			phase: 'pending',
			error: null,
			allowedActions: new Set(),
			actionBindings: {},
		} );
		if ( this.disposed || sequence !== this.sequence ) {
			return;
		}
		try {
			const request: ComponentActionRequest = {
				protocol: 'agent-component/0.1',
				instanceId: opening.instanceId,
				expectedRevision: opening.revision,
				requestId: this.createRequestId?.() ?? globalThis.crypto.randomUUID(),
				...( this.locale ? { locale: this.locale } : {} ),
				event,
			};
			if (
				typeof request.requestId !== 'string' ||
				request.requestId.length > 128 ||
				! /^[a-zA-Z0-9_.:-]+$/.test( request.requestId )
			) {
				throw new Error( 'Invalid request identifier.' );
			}
			const value = await this.transport( request );
			if ( this.disposed || sequence !== this.sequence ) {
				return;
			}
			if ( this.expiresAt <= Date.now() ) {
				this.expire();
				return;
			}
			const response = validateActionResponse( value, request, opening );
			if ( ! response ) {
				this.update( {
					...this.snapshot,
					phase: 'failed',
					error: this.messages.unverifiedOutcome,
				} );
				return;
			}
			const current = response.current;
			if ( current.state === 'awaiting-input' ) {
				this.expiresAt = Math.min( this.expiresAt, Date.parse( current.expiresAt ) );
				this.consumed = this.presentationFailed;
				this.update( {
					result: JSON.parse( JSON.stringify( current.result ) ),
					phase: this.presentationFailed ? 'failed' : 'ready',
					error: this.presentationFailed ? this.snapshot.error : null,
					allowedActions: new Set( this.presentationFailed ? [] : current.allowedActions ),
					actionBindings: this.presentationFailed
						? {}
						: JSON.parse( JSON.stringify( current.actionBindings ) ),
				} );
				this.scheduleExpiry();
				return;
			}
			if (
				( response.outcome !== 'applied' && response.outcome !== 'failed' ) ||
				current.state !== 'completed'
			) {
				this.update( {
					...this.snapshot,
					phase: 'failed',
					error: this.messages.unverifiedOutcome,
				} );
				return;
			}
			this.expiresAt = Math.min( this.expiresAt, Date.parse( current.expiresAt ) );
			this.update( {
				result: JSON.parse( JSON.stringify( current.result ) ),
				phase: 'completed',
				error: this.presentationFailed ? this.snapshot.error : null,
				allowedActions: new Set(),
				actionBindings: {},
			} );
			this.scheduleExpiry();
			if ( this.disposed || sequence !== this.sequence ) {
				return;
			}
			try {
				await this.onContinue( current.result.summary );
			} catch {
				if ( ! this.disposed && sequence === this.sequence ) {
					this.update( {
						...this.snapshot,
						error: this.messages.continuationFailure,
					} );
				}
			}
		} catch {
			if ( ! this.disposed && sequence === this.sequence && ! this.presentationFailed ) {
				this.update( {
					...this.snapshot,
					phase: 'failed',
					error: this.messages.unverifiedOutcome,
				} );
			}
		}
	};
}
