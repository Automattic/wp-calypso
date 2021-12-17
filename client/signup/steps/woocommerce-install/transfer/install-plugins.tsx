import page from 'page';
import { ReactElement, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval/use-interval';
import {
	getSoftwareStatus,
	installSoftware,
	fetchSoftwareStatus,
} from 'calypso/state/atomic-v2/software';
import { getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Progress from './progress';
import './style.scss';

export default function InstallPlugins(): ReactElement | null {
	const dispatch = useDispatch();
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const softwareStatus = useSelector( ( state ) =>
		getSoftwareStatus( state, siteId, 'woo-on-plans' )
	);
	console.log( softwareStatus );
	const softwareApplied = softwareStatus?.status?.applied;
	const wcAdmin = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	const [ progress, setProgress ] = useState( 0.6 );
	// Install Woo on plans software set
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( installSoftware( siteId, 'woo-on-plans' ) );
	}, [ dispatch, siteId ] );

	// Poll for status of installation
	useInterval(
		() => {
			if ( ! siteId ) {
				return;
			}
			setProgress( progress + 0.2 );
			dispatch( fetchSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		softwareApplied ? null : 3000
	);

	// Redirect to wc-admin once software installation is confirmed.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		if ( softwareApplied ) {
			setProgress( 1 );
			// Allow progress bar to complete
			setTimeout( () => {
				page( wcAdmin );
			}, 500 );
		}
	}, [ siteId, softwareApplied, wcAdmin ] );

	// todo: Need error handling on these requests
	return <Progress progress={ progress } />;
}
