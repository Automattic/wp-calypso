import { useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import type { AllowedTypes } from '../sites-overview/types';

export { default as useToggleActivateMonitor } from './use-toggle-activate-monitor';
export { default as useUpdateMonitorSettings } from './use-update-monitor-settings';
export { default as useJetpackAgencyDashboardRecordTrackEvent } from './use-jetpack-agency-dashboard-record-track-event';
export { default as useDashboardShowLargeScreen } from './use-dashboard-show-large-screen';

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
