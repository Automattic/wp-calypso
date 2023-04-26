import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useThemeParam } from 'calypso/landing/stepper/hooks/use-theme-param';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

const SetThemeStep: Step = function SetThemeStep( { navigation } ) {
	const { submit } = navigation;

	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const { setThemeOnSite, installTheme } = useDispatch( SITE_STORE );

	const siteId = useSite()?.ID;
	const siteSlug = useSiteSlugParam() || '';
	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);
	const themeParam = useThemeParam();

	useEffect( () => {
		const themeSlug = themeParam || selectedDesign?.slug;

		if ( ! ( siteSlug && themeSlug ) ) {
			return;
		}

		setPendingAction( async () => {
			try {
				await installTheme( siteSlug, themeSlug );
			} catch ( e ) {
				// TODO: Handle better theme already installed
			}
			await setThemeOnSite( siteSlug, themeSlug ).then( () =>
				reduxDispatch( requestActiveTheme( siteId || -1 ) )
			);
			return { selectedDesign: { slug: themeSlug } };
		} );
		submit?.();
	}, [ siteSlug, selectedDesign ] );

	return null;
};

export default SetThemeStep;
