/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isAbTestInVariant, isEnabled, isNewUser } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export default {
	name: 'themeSheetWelcomeTour',
	version: '20161129',
	path: '/theme',
	when: and(
		isEnabled( 'guided-tours/theme-sheet-welcome' ),
		isNewUser,
		isDesktop,
		isAbTestInVariant( 'themeSheetWelcomeTour', 'enabled' )
	),
};
