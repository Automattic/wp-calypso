/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { and } from 'calypso/layout/guided-tours/utils';
import { isNotNewUser } from 'calypso/state/guided-tours/contexts';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

export default {
	name: 'simplePaymentsTour',
	version: '20170816',
	path: '/post/',
	when: and( isDesktop, isNotNewUser, isCurrentUserEmailVerified ),
};
