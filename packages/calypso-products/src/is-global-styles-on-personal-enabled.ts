export function isGlobalStylesOnPersonalEnabled(): boolean {
	const value = ( window as any ).isGlobalStylesOnPersonal;

	if ( undefined === value ) {
		throw new Error(
			'GlobalStylesOnPersonal config value not found. If in React context make sure to call useSiteGlobalStylesOnPersonal() before this function.'
		);
	}

	return value;
}
