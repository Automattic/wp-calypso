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
import { TRACKING_IDS } from 'calypso/lib/analytics/ad-tracking/constants';

interface WindowWithFullStory extends Window {
	_fs_initialized?: boolean;
}

const FullStoryRecorder: FunctionComponent = () => {
	const currentUserCountryCode = useSelector< string | null >( ( state ) =>
		getCurrentUserCountryCode( state )
	);

	useEffect( () => {
		if ( ! ( window as WindowWithFullStory )._fs_initialized && 'US' === currentUserCountryCode ) {
			init( { orgId: TRACKING_IDS.fullStoryOrgId } );
		} else {
			restart();
		}

		return () => {
			shutdown();
		};
	} );
	return null;
};

export default FullStoryRecorder;
