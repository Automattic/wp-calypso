/**
 * Internal dependencies
 */
import { and } from 'calypso/layout/guided-tours/utils';
import { isNewUser, isEnabled } from 'calypso/state/guided-tours/contexts';

export default {
	name: 'main',
	version: '20160601',
	path: '/',
	when: and( isNewUser, isEnabled( 'guided-tours/main' ) ),
};
