import { useRef } from 'react';
import BaseSiteSelector from 'calypso/components/site-selector';
import { useDispatch, useSelector } from 'calypso/state';
import { hasJetpackPartnerAccess } from 'calypso/state/partner-portal/partner/selectors';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import useOutsideClickCallback from './use-outside-click-callback';

/* NOTE: Code for this component was borrowed from calypso/my-sites/picker,
 * with some slight modifications because we can safely assume we're using
 * Jetpack Cloud.
 */

const SITES_FOCUS = 'sites';

const scrollToTop = () => {
	document.getElementById( 'secondary' ).scrollTop = 0;
	window.scrollTo( 0, 0 );
};

const useHideSiteSelectorOnFocusOut = () => {
	const dispatch = useDispatch();
	const isVisible = useSelector( ( state ) => getCurrentLayoutFocus( state ) === SITES_FOCUS );
	const siteSelectorRef = useRef( null );

	useOutsideClickCallback( siteSelectorRef, () => {
		if ( ! isVisible ) {
			return;
		}

		dispatch( setLayoutFocus( 'sidebar' ) );
		scrollToTop();
	} );

	return siteSelectorRef;
};

const SiteSelector = () => {
	const isVisible = useSelector( ( state ) => getCurrentLayoutFocus( state ) === SITES_FOCUS );
	const siteSelectorRef = useHideSiteSelectorOnFocusOut();
	const canAccessJetpackManage = useSelector( hasJetpackPartnerAccess );

	return (
		<BaseSiteSelector
			forwardRef={ siteSelectorRef }
			className="jetpack-cloud-sidebar__site-selector"
			indicator
			showAddNewSite
			showAllSites={ canAccessJetpackManage }
			/* eslint-disable-next-line jsx-a11y/no-autofocus */
			autoFocus={ isVisible }
			isJetpackAgencyDashboard={ canAccessJetpackManage }
			allSitesPath="/dashboard"
			siteBasePath="/landing"
			wpcomSiteBasePath="https://wordpress.com/home"
		/>
	);
};

export default SiteSelector;
