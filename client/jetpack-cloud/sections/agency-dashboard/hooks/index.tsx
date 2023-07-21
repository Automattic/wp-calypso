import { useBreakpoint } from '@automattic/viewport-react';
import { useCallback, useState, useEffect, RefObject, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import type { AllowedTypes, Site } from '../sites-overview/types';

const DESKTOP_BREAKPOINT = '>1280px';

export { default as useToggleActivateMonitor } from './use-toggle-activate-monitor';
export { default as useUpdateMonitorSettings } from './use-update-monitor-settings';

export function useJetpackAgencyDashboardRecordTrackEvent(
	sites: Array< Site > | null,
	isLargeScreen?: boolean
) {
	const dispatch = useDispatch();

	const buildEventName = useCallback(
		( action: string ) =>
			`calypso_jetpack_agency_dashboard_${ action }_${
				isLargeScreen ? 'large_screen' : 'small_screen'
			}`,
		[ isLargeScreen ]
	);

	const buildSiteProperties = useCallback( () => {
		if ( ! sites?.length ) {
			return {};
		}
		if ( sites.length === 1 ) {
			const { blog_id, url } = sites[ 0 ];
			return {
				selected_site_id: blog_id,
				selected_site_url: url,
			};
		}
		return {
			selected_site_count: sites.length,
		};
	}, [ sites ] );

	const dispatchTrackingEvent = useCallback(
		( action: string, args = {} ) => {
			const name = buildEventName( action );

			const properties = {
				...buildSiteProperties(),
				...args,
			};
			dispatch( recordTracksEvent( name, properties ) );
		},
		[ buildEventName, buildSiteProperties, dispatch ]
	);

	return dispatchTrackingEvent;
}

export const useDashboardShowLargeScreen = (
	siteTableRef: RefObject< HTMLTableElement >,
	containerRef: { current: { clientWidth: number } }
) => {
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );

	const [ isOverflowing, setIsOverflowing ] = useState( false );

	const checkIfOverflowing = useCallback( () => {
		const siteTableEle = siteTableRef ? siteTableRef.current : null;

		if ( siteTableEle ) {
			if ( siteTableEle.clientWidth > containerRef?.current?.clientWidth ) {
				setTimeout( () => {
					setIsOverflowing( true );
				}, 1 );
			}
		}
	}, [ siteTableRef, containerRef ] );

	useEffect( () => {
		window.addEventListener( 'resize', checkIfOverflowing );
		return () => {
			window.removeEventListener( 'resize', checkIfOverflowing );
		};
	}, [ checkIfOverflowing ] );

	useEffect( () => {
		checkIfOverflowing();
		// Do not add checkIfOverflowing to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return isDesktop && ! isOverflowing;
};

export const useDashboardAddRemoveLicense = ( siteId: number, type: AllowedTypes ) => {
	const dispatch = useDispatch();

	const isLicenseSelected = useSelector( ( state ) =>
		hasSelectedLicensesOfType( state, siteId, type )
	);

	const handleAddLicenseAction = () => {
		isLicenseSelected
			? dispatch( unselectLicense( siteId, type ) )
			: dispatch( selectLicense( siteId, type ) );
	};

	return { isLicenseSelected, handleAddLicenseAction };
};

const TIMEOUT_DURATION = 10000;

export const useShowVerifiedBadge = () => {
	const [ verifiedItem, setVerifiedItem ] = useState< { [ key: string ]: string } | undefined >();

	const timeoutIdRef = useRef< ReturnType< typeof setTimeout > | undefined >();

	const handleSetVerifiedItem = useCallback(
		( type: string, item: string ) => {
			if ( verifiedItem ) {
				clearTimeout( timeoutIdRef.current );
			}
			setVerifiedItem( { [ type ]: item } );
			timeoutIdRef.current = setTimeout( () => {
				setVerifiedItem( undefined );
			}, TIMEOUT_DURATION );
		},
		[ verifiedItem ]
	);

	return { verifiedItem, handleSetVerifiedItem };
};
