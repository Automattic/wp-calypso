// TypeScript definitions for the "wpcom" package API surface used by consumers

export type RequestHeaders = Record< string, string >;

export type RequestCallback< TResponse > = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: Error | null,
	data: TResponse,
	headers: RequestHeaders
) => void;

export class Request {
	/* eslint-disable @typescript-eslint/no-explicit-any */
	get< TResponse = unknown >( params: object | string, query?: object ): Promise< TResponse >;
	get< TResponse = unknown >(
		params: object | string,
		callback: RequestCallback< TResponse >
	): void;
	get< TResponse = unknown >(
		params: object | string,
		query: object,
		callback: RequestCallback< TResponse >
	): void;

	post< TResponse = unknown >(
		params: object | string,
		callback: RequestCallback< TResponse >
	): void;
	post< TResponse = unknown >(
		params: object | string,
		query?: object,
		body?: object
	): Promise< TResponse >;
	post< TResponse = unknown >(
		params: object | string,
		query: object,
		body: object,
		callback: RequestCallback< TResponse >
	): void;

	put< TResponse = unknown >(
		params: object | string,
		callback: RequestCallback< TResponse >
	): void;
	put< TResponse = unknown >(
		params: object | string,
		query?: object,
		body?: object
	): Promise< TResponse >;
	put< TResponse = unknown >(
		params: object | string,
		query: object,
		body: object,
		callback: RequestCallback< TResponse >
	): void;

	del< TResponse = unknown >( params: object | string, query?: object ): Promise< TResponse >;
	del< TResponse = unknown >(
		params: object | string,
		query: object,
		callback: RequestCallback< TResponse >
	): void;
	/* eslint-enable @typescript-eslint/no-explicit-any */
}

export interface WpcomInstance {
	/** Convenience request wrapper with helpers and Promise support */
	req: Request;

	/** Load or update the OAuth token at runtime */
	loadToken( token?: string ): void;
	/** Whether a token has been set on this instance */
	isTokenLoaded(): boolean;

	// Factory methods
	domains(): any;
	domain( domainId: string ): any;
	site( id?: string ): any;
	users(): any;
	plans(): any;
	batch(): any;
	freshlyPressed( query?: object, fn?: RequestCallback< unknown > ): any;
}

// Static class references attached to the factory function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WpcomFactoryStatic = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Batch: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Domain: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Domains: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Pinghub: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Plans: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Request: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Site: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Users: any;
};

/** Factory function. Can be invoked with or without `new` at runtime. */
declare const wpcomFactory: ( (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tokenOrHandler?: string | ( ( params: object, callback: any ) => any ),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reqHandler?: ( params: object, callback: any ) => any
) => WpcomInstance ) &
	WpcomFactoryStatic;

export default wpcomFactory;
export type WPCOM = WpcomInstance;
