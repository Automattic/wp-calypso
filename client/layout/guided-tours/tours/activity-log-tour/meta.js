/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNotNewUser } from 'state/ui/guided-tours/contexts';

export default {
	name: 'activityLogTour',
	version: '20171025',
	path: [ '/activity-log/' ],
	when: and( isDesktop, isNotNewUser ),
};
