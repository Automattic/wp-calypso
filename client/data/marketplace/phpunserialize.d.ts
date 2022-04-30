declare module 'phpunserialize' {
	function phpUnserialize( data: string ): Record< unknown, unknown >;

	export default phpUnserialize;
}
