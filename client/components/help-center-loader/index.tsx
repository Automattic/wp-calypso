import { HelpCenter } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { onboardingUrl } from 'calypso/lib/paths';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import type { SiteDetails } from '@automattic/data-stores';
import type { FC } from 'react';

const HELP_CENTER_STORE = HelpCenter.register();

interface HelpCenterLoaderProps {
	site: SiteDetails | null;
	sectionName: string;
	loadHelpCenter: boolean;
	currentRoute?: string;
}

const HelpCenterLoader: FC< HelpCenterLoaderProps > = ( {
	site,
	sectionName,
	loadHelpCenter,
	currentRoute,
} ) => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isDesktop = useBreakpoint( '>782px' );
	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	const locale = useLocale();
	const hasPurchases = useSelector( hasCancelableUserPurchases );
	const user = useSelector( getCurrentUser );

	if ( ! loadHelpCenter ) {
		return null;
	}

	return (
		<AsyncLoad
			require="@automattic/help-center"
			placeholder={ null }
			handleClose={ handleClose }
			currentRoute={ currentRoute }
			locale={ locale }
			sectionName={ sectionName }
			site={ site }
			currentUser={ user }
			hasPurchases={ hasPurchases }
			// hide Calypso's version of the help-center on Desktop, because the Editor has its own help-center
			hidden={ sectionName === 'gutenberg-editor' && isDesktop }
			onboardingUrl={ onboardingUrl() }
			googleMailServiceFamily={ getGoogleMailServiceFamily() }
		/>
	);
};

export default HelpCenterLoader;
