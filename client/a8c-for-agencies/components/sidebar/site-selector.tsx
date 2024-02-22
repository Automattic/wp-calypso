import { useRef } from 'react';
import BaseSiteSelector from 'calypso/components/site-selector';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

/* NOTE: Code for this component was borrowed from calypso/my-sites/picker,
 * with some slight modifications because we can safely assume we're using
 * Automattic for Agencies.
 */

const SITES_FOCUS = 'sites';

const scrollToTop = () => {
	const sidebarRoot = document.getElementById( 'secondary' );
	if ( sidebarRoot ) {
		sidebarRoot.scrollTop = 0;
	}

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

	return (
		<BaseSiteSelector
			forwardRef={ siteSelectorRef }
			className="a4a-sidebar__site-selector"
			indicator
			showAllSites
			/* eslint-disable-next-line jsx-a11y/no-autofocus */
			autoFocus={ isVisible }
			allSitesPath="/"
			siteBasePath="/"
		/>
	);
};

export default SiteSelector;
