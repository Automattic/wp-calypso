/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useEffect, FunctionComponent } from 'react';
import { init, shutdown, restart } from '@fullstory/browser';

/**
 * Internal dependencies
 */
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import { isEnabled } from '@automattic/calypso-config';
import { TRACKING_IDS } from 'calypso/lib/analytics/ad-tracking/constants';

interface WindowWithFullStory extends Window {
	_fs_initialized?: boolean;
}

interface Props {
	record?: boolean;
}

const FullStoryRecorder: FunctionComponent< Props > = ( { record = true } ) => {
	const currentUserCountryCode = useSelector< string | null >( ( state ) =>
		getCurrentUserCountryCode( state )
	);

	const isFullStoryEnabled = isEnabled( 'fullstory' );

	useEffect( () => {
		if ( ! isFullStoryEnabled ) {
			return;
		}

		// No tracking can happen unless we have a US user
		if ( 'US' === currentUserCountryCode ) {
			if ( ! ( window as WindowWithFullStory )._fs_initialized ) {
				init( {
					orgId: TRACKING_IDS.fullStoryOrgId,
					recordOnlyThisIFrame: true,
					devMode: 'development' === process.env.NODE_ENV,
				} );
				// FullStory will start after init, therefore we need to shut it down if we are not supposed to be recording
				if ( ! record ) {
					shutdown();
				}
			} else if ( record ) {
				restart();
			}

			return () => {
				shutdown();
			};
		}
	}, [ currentUserCountryCode, isFullStoryEnabled, record ] );

	return null;
};

export default FullStoryRecorder;
