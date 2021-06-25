declare const __i18n_text_domain__: string;

declare module '@wordpress/compose' {
	function useInstanceId( object: any, prefix: string ): string;

	export { useInstanceId };
}
