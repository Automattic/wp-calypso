/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNewUser } from 'state/ui/guided-tours/contexts';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';

export default {
	name: 'editorBasicsTour',
	version: '20170503',
	path: [ '/post/', '/page/' ],
	when: and( isDesktop, isNewUser, isCurrentUserEmailVerified ),
};
