/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNewUser, isEnabled } from 'state/ui/guided-tours/contexts';

export default {
	name: 'main',
	version: '20160601',
	path: '/',
	when: and( isNewUser, isEnabled( 'guided-tours/main' ) ),
};
