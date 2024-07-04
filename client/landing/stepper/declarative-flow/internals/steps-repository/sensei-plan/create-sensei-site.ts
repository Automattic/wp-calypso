import { useLocale } from '@automattic/i18n-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { Progress } from '../components/sensei-step-progress';
import type { SiteSelect, UserSelect } from '@automattic/data-stores';

export const useCreateSenseiSite = () => {
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const { createSenseiSite, setSelectedSite } = useDispatch( ONBOARD_STORE );
	const { __ } = useI18n();
	const locale = useLocale();
	const visibility = useNewSiteVisibility();

	const siteProgressTitle = __( 'Laying out the foundations' );
	const cartProgressTitle = __( 'Preparing Your Bundle' );

	const [ progress, setProgress ] = useState< Progress >( {
		percentage: 0,
		title: siteProgressTitle,
	} );

	const createAndConfigureSite = useCallback( async () => {
		setProgress( {
			percentage: 25,
			title: siteProgressTitle,
		} );

		await createSenseiSite( {
			username: currentUser?.username || '',
			languageSlug: locale,
			visibility,
		} );

		setProgress( {
			percentage: 75,
			title: cartProgressTitle,
		} );

		const newSite = getNewSite();
		setSelectedSite( newSite?.blogid );

		setProgress( {
			percentage: 100,
			title: cartProgressTitle,
		} );

		return { site: newSite };
	}, [
		createSenseiSite,
		currentUser?.username,
		getNewSite,
		locale,
		setSelectedSite,
		visibility,
		siteProgressTitle,
		cartProgressTitle,
	] );

	return { createAndConfigureSite, progress };
};
