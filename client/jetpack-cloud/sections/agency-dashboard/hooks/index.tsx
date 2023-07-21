import { useBreakpoint } from '@automattic/viewport-react';
import { useCallback, useState, useEffect, RefObject, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import type { AllowedTypes } from '../sites-overview/types';

const DESKTOP_BREAKPOINT = '>1280px';

export { default as useToggleActivateMonitor } from './use-toggle-activate-monitor';
export { default as useUpdateMonitorSettings } from './use-update-monitor-settings';
export { default as useJetpackAgencyDashboardRecordTrackEvent } from './use-jetpack-agency-dashboard-record-track-event';

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
