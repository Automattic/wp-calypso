import page from 'page';
import { ReactElement, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval/use-interval';
import {
	requestAtomicSoftwareStatus,
	requestAtomicSoftwareInstall,
} from 'calypso/state/atomic/software/actions';
import { getAtomicSoftwareStatus } from 'calypso/state/atomic/software/selectors';
import { getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Error from './error';
import Progress from './progress';
import './style.scss';

// Timeout limit for the install to complete.
const TIMEOUT_LIMIT = 1000 * 15; // 15 seconds.

export default function InstallPlugins( {
	onFailure,
}: {
	onFailure: () => void;
} ): ReactElement | null {
	const dispatch = useDispatch();
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const softwareStatus = useSelector( ( state ) =>
		getAtomicSoftwareStatus( state, siteId, 'woo-on-plans' )
	);

	// used to implement a timeout threshold for the install to complete.
	const [ isTimeout, setIsTimeout ] = useState( false );

	const softwareApplied = softwareStatus?.applied;
	const wcAdmin = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	const installFailed = isTimeout;

	const [ progress, setProgress ] = useState( 0.6 );
	// Install Woo on plans software set
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		// Do not dispatch when something went wrong.
		if ( installFailed ) {
			return;
		}

		dispatch( requestAtomicSoftwareInstall( siteId, 'woo-on-plans' ) );
	}, [ dispatch, siteId, installFailed ] );

	// Timeout threshold for the install to complete.
	useEffect( () => {
		const timeId = setTimeout( () => {
			setIsTimeout( true );
			onFailure();
		}, TIMEOUT_LIMIT );

		return () => {
			window?.clearTimeout( timeId );
		};
	}, [ onFailure ] );

	// Poll for status of installation
	useInterval(
		() => {
			// Do not poll when no site or installing failed.
			if ( ! siteId || installFailed ) {
				return;
			}

			setProgress( progress + 0.2 );
			dispatch( requestAtomicSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		softwareApplied ? null : 3000
	);

	// Redirect to wc-admin once software installation is confirmed.
	useEffect( () => {
		if ( ! siteId || installFailed ) {
			return;
		}

		if ( softwareApplied ) {
			setProgress( 1 );
			// Allow progress bar to complete
			setTimeout( () => {
				page( wcAdmin );
			}, 500 );
		}
	}, [ siteId, softwareApplied, wcAdmin, installFailed ] );

	// todo: Need error handling on these requests
	return (
		<>
			{ installFailed && <Error /> }
			{ ! installFailed && <Progress progress={ progress } /> }
		</>
	);
}
