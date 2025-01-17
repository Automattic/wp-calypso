export function isGlobalStylesOnPersonalEnabled(): boolean {
	return !! ( window as any ).isGlobalStylesOnPersonal;
}
