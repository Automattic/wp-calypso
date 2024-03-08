import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { setJetpackConnectionMaybeUnhealthy } from 'calypso/state/jetpack-connection-health/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import 'calypso/state/jetpack-connection-health/init';
import getJetpackConnectionHealth from './get-jetpack-connection-health';

/**
 * Returns true if the current site has possible Jetpack connection problem
 * @param  {Object}  state         Global state tree
 * @param  {?number}  siteId        Site ID
 * @returns {boolean}             Whether the current site can have connection problem
 */
export default function isJetpackConnectionProblem( state, siteId ) {
	const connectionHealth = getJetpackConnectionHealth( state, siteId );

	if ( connectionHealth?.jetpack_connection_problem === undefined ) {
		return false;
	}

	return connectionHealth.jetpack_connection_problem;
}

/**
 * Hook to check if the current site has possible Jetpack connection problem.
 *
 * Returns true if the current site has possible Jetpack connection problem
 * @param  {?number}  siteId        Site ID
 */
export const useIsJetpackConnectionProblem = ( siteId ) => {
	const dispatch = useDispatch();
	const isPossibleConnectionProblem = useSelector( ( state ) => {
		return isJetpackConnectionProblem( state, siteId );
	} );

	useEffect( () => {
		const onMessage = ( event ) => {
			const error = event.data?.[ 0 ];
			const status = event.data?.[ 1 ];
			if ( status > 200 && typeof error?.message === 'string' ) {
				if ( error.message.includes( 'site is inaccessible' ) && ! isPossibleConnectionProblem ) {
					dispatch( setJetpackConnectionMaybeUnhealthy( siteId ) );
				}
			}
		};

		/**
		 * This event listener is used to detect if the site is inaccessible.
		 * Among others it's used as a login in `wpcom-proxy-request` package,
		 * and the idea is borrowed from there to detect the site inaccessibility.
		 */

		if ( typeof window !== 'undefined' ) {
			window.addEventListener( 'message', onMessage );
		}

		return () => {
			if ( typeof window !== 'undefined' ) {
				window.removeEventListener( 'message', onMessage );
			}
		};
	}, [ isPossibleConnectionProblem, siteId, dispatch ] );

	return isPossibleConnectionProblem;
};

/**
 * React HOC to check if the current site has possible Jetpack connection problem.
 */
export const withJetpackConnectionProblem = ( Wrapped ) => ( props ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isPossibleConnectionProblem = useIsJetpackConnectionProblem( siteId );
	return (
		<Wrapped { ...props } isPossibleJetpackConnectionProblem={ isPossibleConnectionProblem } />
	);
};
