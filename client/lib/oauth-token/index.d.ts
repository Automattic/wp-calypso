declare module 'calypso/lib/oauth-token' {
	const getToken: () => string | boolean;
	const setToken: ( token: string ) => void;
	const clearToken: () => void;

	export { getToken, setToken, clearToken };
}
