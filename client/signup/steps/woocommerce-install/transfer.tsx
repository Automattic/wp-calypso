import { ProgressBar } from '@automattic/components';
import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
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
import type { GoToStep } from '../../types';
import type { AppState } from 'calypso/types';

interface Props {
	goToStep: GoToStep;
}

export default function Transfer( { goToStep }: Props ): ReactElement | null {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const [ progress, setProgress ] = useState( 0 );
	const [ error, setError ] = useState( { transferFailed: false, transferStatus: null } );

	const dispatch = useDispatch();

	// Select state
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
				setProgress( 20 );
				break;
			case transferStates.SETUP:
			case transferStates.CONFLICTS:
			case transferStates.ACTIVE:
				setProgress( 50 );
				break;
			case transferStates.UPLOADING:
			case transferStates.BACKFILLING:
				setProgress( 60 );
				break;
			case transferStates.COMPLETE:
				setProgress( 100 );
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
			setProgress( 100 );
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

	return (
		<>
			<div className="woocommerce-install__heading-wrapper">
				<div className="woocommerce-install__heading">
					<Title>{ __( 'Upgrading your site…' ) }</Title>
					<SubTitle></SubTitle>

					<div className="woocommerce-install__buttons-group">
						<div>
							<BackButton onClick={ () => goToStep( 'confirm' ) } />
						</div>
					</div>
				</div>
			</div>
			<div className="woocommerce-install__content">
				<div>
					{ error.transferFailed && 'error...' }
					{ error.transferFailed && error.transferStatus }
					<ProgressBar value={ progress || 1 } total={ 100 } isPulsing />
					<NextButton onClick={ () => goToStep( 'install' ) }>{ __( 'Next' ) }</NextButton>
				</div>
			</div>
		</>
	);
}
