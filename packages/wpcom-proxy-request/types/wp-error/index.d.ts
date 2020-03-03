declare module 'wp-error' {
	function WPError( ...args: unknown[] ): Error;
	export = WPError;
}
