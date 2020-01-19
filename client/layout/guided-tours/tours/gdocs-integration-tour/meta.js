/**
 * Internal dependencies
 */
import { and } from 'layout/guided-tours/utils';
import { hasUserPastedFromGoogleDocs } from 'state/ui/guided-tours/contexts';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';

export default {
	name: 'gdocsIntegrationTour',
	version: '20170227',
	path: '/post',
	when: and( isCurrentUserEmailVerified, hasUserPastedFromGoogleDocs ),
};
