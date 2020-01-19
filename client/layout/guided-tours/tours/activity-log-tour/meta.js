/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNotNewUser } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export default {
	name: 'activityLogTour',
	version: '20171025',
	path: [ '/activity-log/' ],
	when: and( isDesktop, isNotNewUser ),
};
