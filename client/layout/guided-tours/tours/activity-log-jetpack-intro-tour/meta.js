/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isSelectedSiteJetpack } from 'state/ui/guided-tours/contexts';

export default {
	name: 'activityLogJetpackIntroTour',
	version: '20180808',
	path: '/activity-log/',
	when: and( isSelectedSiteJetpack ),
};
