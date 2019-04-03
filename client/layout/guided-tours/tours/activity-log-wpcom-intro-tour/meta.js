/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isSelectedSiteNotJetpack } from 'state/ui/guided-tours/contexts';

export default {
	name: 'activityLogWpcomIntroTour',
	version: '20180808',
	path: '/activity-log/',
	when: and( isSelectedSiteNotJetpack ),
};
