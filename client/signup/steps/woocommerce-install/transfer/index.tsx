import { Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	isFetchingAutomatedTransferStatus,
	getAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { hasUploadFailed } from 'calypso/state/themes/upload-theme/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { GoToStep } from '../../../types';
import type { AppState } from 'calypso/types';

import './style.scss';

interface Props {
	goToStep: GoToStep;
}

export default function Transfer( { goToStep }: Props ): ReactElement | null {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const [ progress, setProgress ] = useState( 0.1 );
	const [ error, setError ] = useState( { transferFailed: false, transferStatus: null } );

	const siteId = useSelector( getSelectedSiteId ) as number;
	const fetchingTransferStatus = !! useSelector( ( state: AppState ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);
	const transferStatus = useSelector( ( state: AppState ) =>
		getAutomatedTransferStatus( state, siteId )
	);
	const transferFailed = useSelector( ( state: AppState ) => hasUploadFailed( state, siteId ) );

	// Initiate Atomic transfer
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( initiateThemeTransfer( siteId, null, 'woocommerce' ) );
	}, [ siteId, dispatch ] );

	// Watch transfer status
	useEffect( () => {
		if ( ! siteId ) {
			goToStep( 'confirm' );
			return;
		}

		if ( fetchingTransferStatus ) {
			return;
		}

		switch ( transferStatus ) {
			case transferStates.NONE:
			case transferStates.PENDING:
			case transferStates.INQUIRING:
			case transferStates.PROVISIONED:
			case transferStates.FAILURE:
			case transferStates.START:
			case transferStates.REVERTED:
				setProgress( 0.1 );
				break;
			case transferStates.SETUP:
			case transferStates.CONFLICTS:
			case transferStates.ACTIVE:
				setProgress( 0.5 );
				break;
			case transferStates.UPLOADING:
			case transferStates.BACKFILLING:
				setProgress( 0.6 );
				break;
			case transferStates.COMPLETE:
				setProgress( 1 );
				goToStep( 'complete' );
				break;
		}

		if (
			transferFailed ||
			transferStatus === transferStates.ERROR ||
			transferStatus === transferStates.FAILURE ||
			transferStatus === transferStates.REQUEST_FAILURE ||
			transferStatus === transferStates.CONFLICTS
		) {
			setProgress( 1 );
			setError( { transferFailed, transferStatus } );
		}
	}, [
		setProgress,
		setError,
		siteId,
		goToStep,
		fetchingTransferStatus,
		transferStatus,
		transferFailed,
	] );

	// Progress smoothing, works out to be around 40seconds unless transfer step polling dictates otherwise
	const [ simulatedProgress, setSimulatedProgress ] = useState( 0.01 );
	useEffect( () => {
		const timeOutReference = setTimeout( () => {
			if ( progress > simulatedProgress ) {
				setSimulatedProgress( progress );
			} else if ( simulatedProgress <= 1 ) {
				setSimulatedProgress( ( previousProgress ) => {
					// Stall at 95%, allow complete to finish up
					let newProgress = previousProgress + Math.random() * 0.05;
					if ( newProgress >= 0.95 ) {
						newProgress = 0.95;
					}
					return newProgress;
				} );
			}
		}, 1000 );
		return () => clearTimeout( timeOutReference );
	}, [ simulatedProgress, progress ] );

	return (
		<div className="transfer__step-wrapper">
			<div className="transfer__heading-wrapper woocommerce-install__heading-wrapper">
				<div className="transfer__heading woocommerce-install__heading">
					<Title>{ __( 'Upgrading your site…' ) }</Title>
				</div>
			</div>
			<div className="transfer__content woocommerce-install__content">
				{ error.transferFailed && 'error...' /* todo */ }
				{ error.transferFailed && error.transferStatus }
				<div className="transfer__progress-bar" style={ { '--progress': simulatedProgress } } />
			</div>
		</div>
	);
}
