import { useSelect } from '@wordpress/data';
import { useCallback } from 'react';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import { useSite } from './use-site';

export const useRecordSignupComplete = ( flow: string | null ) => {
	const site = useSite();
	const siteId = site?.ID || null;
	const theme = site?.options?.theme_slug || '';
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const siteCount = currentUser?.site_count ?? 0;

	return useCallback( () => {
		recordSignupComplete(
			{
				flow,
				siteId: siteId,
				isNewUser: siteCount <= 1,
				hasCartItems: false,
				isNew7DUserSite: '',
				theme,
				intent: flow,
				startingPoint: flow,
				isBlankCanvas: theme?.includes( 'blank-canvas' ),
			},
			true
		);
	}, [ flow, siteId, siteCount, theme ] );
};
