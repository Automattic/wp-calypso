import { isEnabled } from '@automattic/calypso-config';
import { VERTICALIZABLE_STANDARD_THEMES } from './constants';

export function isThemeVerticalizable( stylesheet?: string ): boolean {
	return (
		isEnabled( 'signup/standard-theme-v13n' ) &&
		!! stylesheet &&
		!! VERTICALIZABLE_STANDARD_THEMES.find( ( theme ) => stylesheet?.startsWith( theme ) )
	);
}
