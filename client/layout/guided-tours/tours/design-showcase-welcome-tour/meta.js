/**
 * Internal dependencies
 */
import { and, not } from 'layout/guided-tours/utils';
import {
	isAbTestInVariant,
	inSection,
	isNewUser,
	isEnabled,
	selectedSiteIsCustomizable,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export default {
	name: 'designShowcaseWelcome',
	version: '20161206',
	path: '/themes',
	when: and(
		isNewUser,
		isEnabled( 'guided-tours/design-showcase-welcome' ),
		isDesktop,
		selectedSiteIsCustomizable,
		not( inSection( 'customize' ) ),
		isAbTestInVariant( 'designShowcaseWelcomeTour', 'enabled' )
	),
};
