import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isHostingTrialSite } from 'calypso/sites-dashboard/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { AppState } from 'calypso/types';

export const useTrialHelpers = ( { ...props } ) => {
	const [ isTrialAcknowledgeModalOpen, setIsTrialAcknowledgeModalOpen ] = useState( false );
	const [ trialTransferStates, setTrialTransferStates ] = useState( {
		isTransferring: false,
		hasRequestedTrial: false,
	} );

	const isEligibleForTrial = useSelector( isUserEligibleForFreeHostingTrial );
	const site = props.selectedSite;
	const isFreeSite = site?.plan?.is_free;
	const isTrialSite = isHostingTrialSite( site );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEligibleForHostingTrial = isEligibleForTrial && isFreeSite && isLoggedIn;
	const isAtomic = useSelector( ( state: AppState ) => isSiteWpcomAtomic( state, site?.ID ) );

	const setOpenModal = ( isOpen: boolean ) => {
		setIsTrialAcknowledgeModalOpen( isOpen );
	};

	useEffect( () => {
		if ( isTrialSite && ! isAtomic ) {
			setTrialTransferStates( {
				isTransferring: true,
				hasRequestedTrial: true,
			} );
		}
	}, [] );

	const trialRequested = () => {
		setTrialTransferStates( {
			isTransferring: true,
			hasRequestedTrial: true,
		} );
	};

	const requestUpdatedSiteData = useCallback(
		( isTransferring: boolean, wasTransferring: boolean, isTransferCompleted: boolean ) => {
			if ( ! isTransferring && wasTransferring && isTransferCompleted ) {
				props.fetchUpdatedData();
				setTrialTransferStates( {
					isTransferring: false,
					hasRequestedTrial: true,
				} );
			}
		},
		[]
	);

	return {
		isTrialAcknowledgeModalOpen,
		setIsTrialAcknowledgeModalOpen,
		isAtomic,
		...trialTransferStates,
		trialRequested,
		requestUpdatedSiteData,
		setOpenModal,
		isEligibleForHostingTrial,
	};
};
