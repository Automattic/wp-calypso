/**
 * Internal dependencies
 */
import { and } from 'calypso/layout/guided-tours/utils';
import { hasUserPastedFromGoogleDocs } from 'calypso/state/guided-tours/contexts';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

export default {
	name: 'gdocsIntegrationTour',
	version: '20170227',
	path: '/post',
	when: and( isCurrentUserEmailVerified, hasUserPastedFromGoogleDocs ),
};
