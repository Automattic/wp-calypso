import { useEffect, useState } from 'react';
import { useInterval } from 'calypso/lib/interval/use-interval';
import { useSelector, useDispatch } from 'calypso/state';
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
import { FailureInfo } from '.';

// Timeout limit for the install to complete.
const TIMEOUT_LIMIT = 1000 * 45; // 45 seconds.

export default function InstallPlugins( {
	onFailure,
	trackRedirect,
}: {
	onFailure: ( type: FailureInfo ) => void;
	trackRedirect: () => void;
} ) {
	const dispatch = useDispatch();
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const { status: softwareStatus, error: softwareError } = useSelector( ( state ) =>
		getAtomicSoftwareStatus( state, siteId, 'woo-on-plans' )
	);

	// Used to implement a timeout threshold for the install to complete.
	const [ isTimeoutError, setIsTimeoutError ] = useState( false );

	const softwareApplied = !! softwareStatus?.applied;

	const wcAdminUrl = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	const installFailed = isTimeoutError || softwareError;

	const [ progress, setProgress ] = useState( 0.6 );
	// Install Woo on plans software set
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestAtomicSoftwareInstall( siteId, 'woo-on-plans' ) );
	}, [ dispatch, siteId ] );

	// Call onFailure callback when install fails.
	useEffect( () => {
		if ( ! softwareError ) {
			return;
		}

		onFailure( {
			type: 'install',
			error: softwareError?.message || '',
			code: softwareError?.code || '',
		} );
	}, [ softwareError, onFailure ] );

	// Timeout threshold for the install to complete.
	useEffect( () => {
		if ( installFailed ) {
			return;
		}

		const timeId = setTimeout( () => {
			setIsTimeoutError( true );
			onFailure( {
				type: 'install_timeout',
				error: 'install took too long',
				code: 'install_timeout',
			} );
		}, TIMEOUT_LIMIT );

		return () => {
			window?.clearTimeout( timeId );
		};
	}, [ onFailure, installFailed ] );

	// Poll for status of installation
	useInterval(
		() => {
			// Do not poll when no site or installing failed.
			if ( ! siteId || installFailed ) {
				return;
			}

			setProgress( progress + 20 );
			dispatch( requestAtomicSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		!! installFailed || softwareApplied ? null : 3000
	);

	// Redirect to wc-admin once software installation is confirmed.
	useEffect( () => {
		if ( ! siteId || installFailed ) {
			return;
		}

		if ( softwareApplied ) {
			trackRedirect();
			setProgress( 100 );
			// Allow progress bar to complete
			setTimeout( () => {
				window.location.assign( wcAdminUrl );
			}, 500 );
		}
	}, [ siteId, softwareApplied, wcAdminUrl, installFailed, trackRedirect ] );

	return installFailed ? <Error /> : <Progress progress={ progress } />;
}
