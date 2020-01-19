/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNewUser, isEnabled, isSelectedSitePreviewable } from 'state/ui/guided-tours/contexts';

export default {
	name: 'tutorialSitePreview',
	version: '20170101',
	path: '/stats',
	when: and(
		isEnabled( 'guided-tours/tutorial-site-preview' ),
		isSelectedSitePreviewable,
		isNewUser
	),
};
