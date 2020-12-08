/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'calypso/layout/guided-tours/utils';
import { isNewUser } from 'calypso/state/guided-tours/contexts';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

export default {
	name: 'editorBasicsTour',
	version: '20170503',
	path: [ '/post/', '/page/' ],
	when: and( isDesktop, isNewUser, isCurrentUserEmailVerified ),
};
