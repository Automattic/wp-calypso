/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { isNotNewUser } from 'state/ui/guided-tours/contexts';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';

export default {
	name: 'simplePaymentsTour',
	version: '20170816',
	path: '/post/',
	when: and( isDesktop, isNotNewUser, isCurrentUserEmailVerified ),
};
