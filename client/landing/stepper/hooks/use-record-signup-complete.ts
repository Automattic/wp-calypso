import { useSelect } from '@wordpress/data';
import { useCallback } from 'react';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import { useSite } from './use-site';

export const useRecordSignupComplete = ( flow: string | null ) => {
	const site = useSite();
	const siteId = site?.ID || null;
	const theme = site?.options?.theme_slug || '';
	const siteCount = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() )?.site_count;

	return useCallback( () => {
		recordSignupComplete(
			{
				flow,
				siteId: siteId,
				isNewUser: ! siteCount,
				hasCartItems: false,
				isNew7DUserSite: '',
				theme,
				intent: flow,
				startingPoint: flow,
				isBlankCanvas: theme?.includes( 'blank-canvas' ),
				domainProductSlug: '',
				planProductSlug: '',
			},
			true
		);
	}, [ flow, siteId, siteCount, theme ] );
};
