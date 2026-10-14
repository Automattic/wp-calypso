import page from '@automattic/calypso-router';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import Loading from 'calypso/components/loading';
import { useWaitHeartbeat } from 'calypso/lib/analytics/wait-heartbeat';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { errorNotice } from 'calypso/state/notices/actions';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';

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

	// A completed transfer is not the end of the wait: the parent keeps this screen up until it has
	// also verified that WooCommerce finished installing. Being mounted is the condition, so the wait
	// runs for as long as this component does and `transfer_status` says how it ended. The site is
	// still the exception — the parent renders this screen before site data has necessarily arrived,
	// and passes 0 until it has.
	useWaitHeartbeat( {
		surface: 'checkout_thank_you_transfer',
		enabled: !! siteId,
		properties: {
			site_id: siteId,
			order_id: orderId,
			transfer_status: transfer?.status ?? null,
		},
	} );

	const steps = React.useRef< string[] >( [
		__( 'Setting up your site' ),
		__( 'Upgrading infrastructure' ),
		__( 'Preparing WooCommerce' ),
	] );

	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = React.useState( 0 );

	/**
	 * Completion progress: 0 <= progress <= 100
	 */
	const progress = ( ( currentStep + 1 ) / totalSteps ) * 100;
	const isComplete = progress >= 100;

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

	const latestTransfer = React.useRef( transfer );
	latestTransfer.current = transfer;

	// A client_timeout already in the store when this screen asks for the transfer is an earlier
	// wait's verdict: the request drops it, and only a timeout stored afterwards ends this wait.
	const preRequestTransfer = React.useRef( transfer );
	React.useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		preRequestTransfer.current = latestTransfer.current;
		dispatch( fetchAtomicTransfer( siteId ) );
	}, [ siteId, dispatch ] );

	// Redirect based on transfer status
	const didRedirect = React.useRef( false );
	React.useEffect( () => {
		const redirectWithNotice = ( message: string ) => {
			if ( didRedirect.current ) {
				return;
			}

			dispatch(
				errorNotice( message, {
					id: 'atomic-transfer-error',
					isPersistent: true,
					displayOnNextPage: true,
				} )
			);

			setHasStarted( false );

			didRedirect.current = true;
			page( `/stats/${ siteSlug }` );
		};

		if ( transfer ) {
			if ( transferStates.COMPLETED === transfer.status ) {
				page( `/checkout/thank-you/${ siteSlug }/${ orderId }` );

				return;
			}

			// If the processing status indicates that there was something wrong.
			if ( [ transferStates.ERROR, transferStates.REVERTED ].includes( transfer.status ) ) {
				// Redirect users back to the stats page so they can try again.
				redirectWithNotice(
					__( "Sorry, we couldn't process your transfer. Please try again later." )
				);

				return;
			}

			if ( transferStates.CLIENT_TIMEOUT === transfer.status ) {
				if ( transfer !== preRequestTransfer.current ) {
					redirectWithNotice(
						__(
							'Your transfer is taking longer than expected. It may still finish — reload the page to check.'
						)
					);
				}

				return;
			}
		}
	}, [ transfer, dispatch, siteSlug, __, orderId ] );

	const progressValue = ! hasStarted ? /* initial 10% progress */ 10 : progress;

	return (
		<Loading
			title={ steps.current[ currentStep ] }
			progress={ progressValue }
			/* translators: %(currentStep)d is the step now running and %(totalSteps)d the number of steps in total. Example: Step 1 of 3 */
			subtitle={ sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
				currentStep: currentStep + 1,
				totalSteps,
			} ) }
		/>
	);
};

export default TransferPending;
