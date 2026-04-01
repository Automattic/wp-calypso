declare module '@automattic/oauth-token' {
	const getToken: () => string | boolean;
	interface SetTokenOptions {
		maxAge?: number;
		path?: string;
		sameSite?: 'strict' | 'lax' | 'none';
		secure?: boolean;
	}
	const setToken: ( token: string, options?: SetTokenOptions ) => void;
	const clearToken: ( path?: string ) => void;

	export { getToken, setToken, clearToken };
}
