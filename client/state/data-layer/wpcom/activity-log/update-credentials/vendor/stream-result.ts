/** @format */

import { TransportError } from './transport-error';

export class StreamResult< T, E > {
	public isError: boolean;
	public value?: T;
	public error?: E;

	private constructor( isError: boolean, x: unknown ) {
		this.isError = isError;

		if ( isError ) {
			this.error = x as E;
		} else {
			this.value = x as T;
		}
	}

	public static ok< T_, E_ >( value: T_ ): StreamResult< T_, E_ > {
		return new StreamResult( false, value );
	}

	public static err< T_, E_ >( error: E_ ): StreamResult< T_, E_ > {
		return new StreamResult( true, error );
	}

	public static of< T_ >( x: Error | T_ ): StreamResult< T_, Error > {
		if ( x instanceof Error ) {
			return StreamResult.err( x );
		} else {
			return StreamResult.ok( x );
		}
	}

	public static parse< T_ >( result: string ): StreamResult< T_, TransportError > {
		// TODO @azabani clean up as part of StreamResult refinements
		const parsed = JSON.parse( result ) as StreamResult< T_, TransportError >;

		if ( 'error' in parsed ) {
			// server Error#stack becomes client Error#trace
			const { message, stack: trace } = parsed.error!;
			const error = new TransportError( message, trace!, 500 );

			return StreamResult.err( error );
		}

		return StreamResult.ok( parsed.value! );
	}

	public static stringify< T_ >( x: Error | T_ ): string {
		return `${ JSON.stringify( StreamResult.of( x ) ) }\n`;
	}

	public toJSON( key: string ) {
		if ( this.isError && this.error instanceof Error ) {
			const { message, stack } = this.error;
			const error = { message, stack };

			return Object.assign( {}, this, { error } );
		}

		return this;
	}

	public unwrapOrThrow(): T {
		if ( this.isError ) {
			throw this.error;
		}

		return this.value!;
	}
}
