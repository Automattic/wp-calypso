export function isActiveThemeFSEEnabled( activeThemeData ) {
	return activeThemeData?.[ 0 ]?.theme_supports[ 'block-templates' ] ?? false;
}
