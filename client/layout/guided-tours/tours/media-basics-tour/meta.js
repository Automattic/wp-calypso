/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNewUser } from 'state/ui/guided-tours/contexts';

export default {
	name: 'mediaBasicsTour',
	version: '20170321',
	path: '/media',
	when: and( isDesktop, isNewUser ),
};
