/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import {
	hasSelectedSiteDefaultSiteTitle,
	isUserOlderThan,
	isEnabled,
	canUserEditSettingsOfSelectedSite,
	isAbTestInVariant,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

const TWO_DAYS_IN_MILLISECONDS = 2 * 1000 * 3600 * 24;

export default {
	name: 'siteTitle',
	version: '20161207',
	path: '/stats',
	when: and(
		isEnabled( 'guided-tours/site-title' ),
		isDesktop,
		hasSelectedSiteDefaultSiteTitle,
		canUserEditSettingsOfSelectedSite,
		isUserOlderThan( TWO_DAYS_IN_MILLISECONDS ),
		isAbTestInVariant( 'siteTitleTour', 'enabled' )
	),
};
