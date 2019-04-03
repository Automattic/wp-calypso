/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNewUser } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export default {
	name: 'mediaBasicsTour',
	version: '20170321',
	path: '/media',
	when: and( isDesktop, isNewUser ),
};
