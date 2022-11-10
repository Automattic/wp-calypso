import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import type { Step } from '../../types';

import './styles.scss';

const SetThemeStep: Step = function SetThemeStep( { navigation } ) {
	const { submit } = navigation;

	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );

	useEffect( () => {
		setPendingAction( async () => {
			if ( siteSlugOrId && selectedDesign ) {
				try {
					await setDesignOnSite( siteSlugOrId, selectedDesign ).then( () =>
						reduxDispatch( requestActiveTheme( site?.ID || -1 ) )
					);
				} catch ( e ) {
					// For Atomic sites I get "Theme not found" for most of themes I tested
					// eslint-disable-next-line no-console
					console.log( e );
				}
				return { selectedDesign };
			}
		} );
		submit?.();
	}, [ selectedDesign, siteSlugOrId ] );

	return null;
};

export default SetThemeStep;
