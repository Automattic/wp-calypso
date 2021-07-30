/**
 * External dependencies
 */
import page from 'page';
import * as React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { errorNotice } from 'calypso/state/notices/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import { useInterval } from '../../../../lib/interval/use-interval';

/**
 * Style dependencies
 */
import './style.scss';

// Total time to perform "loading"
const DURATION_IN_MS = 60000;

// Props type
interface Props {
	siteId: number;
	orderId: number;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
const TransferPending: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { siteId, orderId } = props;
	const dispatch = useDispatch();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const transfer = useSelector( ( state ) => getAtomicTransfer( state, siteId ) );

	const steps = React.useRef< string[] >( [
		__( 'Upgrading your site' ),
		__( 'Installing plugin' ),
		__( 'Activating plugin' ),
	] );

	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = React.useState( 0 );

	/**
	 * Completion progress: 0 <= progress <= 1
	 */
	const progress = ( currentStep + 1 ) / totalSteps;
	const isComplete = progress >= 1;

	useInterval(
		() => setCurrentStep( ( s ) => s + 1 ),
		// Enable the interval when progress is incomplete
		isComplete ? null : DURATION_IN_MS / totalSteps
	);

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = React.useState( false );
	React.useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	// Hide toolbar while component is mounted
	React.useEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	// Redirect based on transfer status
	React.useEffect( () => {
		const retryOnError = () => {
			page( `/stats/${ siteSlug }` );

			dispatch(
				errorNotice( __( "Sorry, we couldn't process your transfer. Please try again later." ) )
			);
		};

		if ( transfer ) {
			if ( transferStates.COMPLETED === transfer.status ) {
				page( `/checkout/thank-you/${ siteSlug }/${ orderId }` );

				return;
			}

			// If the processing status indicates that there was something wrong.
			if ( transferStates.ERROR === transfer.status ) {
				// Redirect users back to the stats page so they can try again.
				retryOnError();

				return;
			}
		}
	}, [ transfer, dispatch, siteSlug, __, orderId ] );

	return (
		<div className="transfer-pending">
			<h1 className="transfer-pending__progress-step">{ steps.current[ currentStep ] }</h1>
			<div
				className="transfer-pending__progress-bar"
				style={
					{
						'--progress': ! hasStarted ? /* initial 10% progress */ 0.1 : progress,
					} as React.CSSProperties
				}
			/>
			<p className="transfer-pending__progress-numbered-steps">
				{
					// translators: these are progress steps. Eg: step 1 of 4.
					sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
						currentStep: currentStep + 1,
						totalSteps,
					} )
				}
			</p>
		</div>
	);
};

export default TransferPending;
