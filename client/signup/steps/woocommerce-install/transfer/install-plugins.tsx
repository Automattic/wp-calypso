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
import Progress from './progress';
import './style.scss';

export default function InstallPlugins(): ReactElement | null {
	const dispatch = useDispatch();
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const softwareStatus = useSelector( ( state ) =>
		getAtomicSoftwareStatus( state, siteId, 'woo-on-plans' )
	);
	const wcAdmin = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	const [ progress, setProgress ] = useState( 0.6 );
	// Install Woo on plans software set
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestAtomicSoftwareInstall( siteId, 'woo-on-plans' ) );
	}, [ dispatch, siteId ] );

	// Poll for status of installation
	useInterval(
		() => {
			if ( ! siteId ) {
				return;
			}
			setProgress( progress + 0.2 );
			dispatch( requestAtomicSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		softwareStatus.applied ? null : 3000
	);

	// Redirect to wc-admin once software installation is confirmed.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		if ( softwareStatus.applied ) {
			setProgress( 1 );
			// Allow progress bar to complete
			setTimeout( () => {
				window.location.href = wcAdmin;
			}, 1000 );
		}
	}, [ siteId, softwareStatus, wcAdmin ] );

	// todo: Need error handling on these requests
	return <Progress progress={ progress } />;
}
