/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'calypso/layout/guided-tours/utils';
import { isNewUser } from 'calypso/state/guided-tours/contexts';

export default {
	name: 'mediaBasicsTour',
	version: '20170321',
	path: '/media',
	when: and( isDesktop, isNewUser ),
};
