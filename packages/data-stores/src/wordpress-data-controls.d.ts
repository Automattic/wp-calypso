type AnyAction = {
	type: T;
	[ extraProps: string ]: any;
};

interface APIFetchOptions extends RequestInit {
	// Override headers, we only accept it as an object due to the `nonce` middleware
	headers?: Record< string, string >;
	path?: string;
	url?: string;
	/**
	 * @default true
	 */
	parse?: boolean;
	data?: any;
	namespace?: string;
	endpoint?: string;
}

declare module '@wordpress/data-controls' {
	export function apiFetch( options: APIFetchOptions ): unknown;

	export const controls: {
		API_FETCH: ( action: AnyAction ) => Promise< any >;
		DISPATCH: ( action: AnyAction ) => void;
		SELECT: ( action: AnyAction ) => any;
	};

	export function dispatch( storeKey: string, actionName: string, ...args: any[] ): void;
	export function select( storeKey: string, selectorName: string, ...args: any[] ): void;
}
