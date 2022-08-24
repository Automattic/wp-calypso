import { isEnabled } from '@automattic/calypso-config';
import { STANDARD_THEMES_V13N_WHITELIST } from './constants';

export function isDesignAvailableForV13N( stylesheet?: string ): boolean {
	return (
		isEnabled( 'signup/standard-theme-v13n' ) &&
		!! stylesheet &&
		!! STANDARD_THEMES_V13N_WHITELIST.find( ( theme ) => stylesheet?.startsWith( theme ) )
	);
}
