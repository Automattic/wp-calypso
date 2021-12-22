import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Filterbar from 'calypso/my-sites/activity/filterbar';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

const stickToWindowTop = ( el: HTMLDivElement ) => {
	const masterBar = document.querySelector( '.masterbar' );
	if ( ! masterBar ) {
		return;
	}

	const elementTop = el.getBoundingClientRect().top;
	const masterBarHeight = masterBar.clientHeight;

	const shouldBeSticky = window.scrollY + masterBarHeight >= elementTop;
	el.classList.toggle( 'is-sticky', shouldBeSticky );
};

const useScrollHandler = ( element: HTMLDivElement | null ) => {
	const scrollTicking = useRef( false );

	const onScroll = useCallback( () => {
		if ( ! element ) {
			return;
		}

		if ( scrollTicking.current ) {
			return;
		}

		// It's best practice to throttle scroll event for performance
		window.requestAnimationFrame( () => {
			stickToWindowTop( element );
			scrollTicking.current = false;
		} );

		scrollTicking.current = true;
	}, [ element, scrollTicking ] );

	const isMobile = useMobileBreakpoint();
	useEffect( () => {
		if ( ! isMobile ) {
			return;
		}

		window.addEventListener( 'scroll', onScroll );
		return () => window.removeEventListener( 'scroll', onScroll );
	}, [ isMobile, onScroll ] );
};

const FilterBarContainer = () => {
	const ref = useRef( null );
	useScrollHandler( ref.current );

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );

	return (
		<div className="activity-card-list__filterbar-ctn" ref={ ref }>
			<Filterbar isVisible siteId={ siteId } filter={ filter } />
		</div>
	);
};

export default FilterBarContainer;
