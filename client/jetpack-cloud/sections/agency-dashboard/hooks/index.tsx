import { useCallback, useState, useRef } from 'react';

export { default as useToggleActivateMonitor } from './use-toggle-activate-monitor';
export { default as useUpdateMonitorSettings } from './use-update-monitor-settings';
export { default as useJetpackAgencyDashboardRecordTrackEvent } from './use-jetpack-agency-dashboard-record-track-event';
export { default as useDashboardShowLargeScreen } from './use-dashboard-show-large-screen';
export { default as useDashboardAddRemoveLicense } from './use-dashboard-add-remove-license';

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
