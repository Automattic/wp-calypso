import { HelpCenter } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { onboardingUrl } from 'calypso/lib/paths';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const HELP_CENTER_STORE = HelpCenter.register();

type Props = {
	sectionName: string;
	loadHelpCenter: boolean;
	currentRoute: string;
};

export default function HelpCenterLoader( { sectionName, loadHelpCenter, currentRoute }: Props ) {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isDesktop = useBreakpoint( '>782px' );
	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	const locale = useLocale();
	const hasPurchases = useSelector( hasCancelableUserPurchases );
	const user = useSelector( getCurrentUser );
	const selectedSite = useSelector( getSelectedSite );
	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

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
			site={ selectedSite || primarySite }
			currentUser={ user }
			hasPurchases={ hasPurchases }
			// hide Calypso's version of the help-center on Desktop, because the Editor has its own help-center
			hidden={ sectionName === 'gutenberg-editor' && isDesktop }
			onboardingUrl={ onboardingUrl() }
			googleMailServiceFamily={ getGoogleMailServiceFamily() }
		/>
	);
}
