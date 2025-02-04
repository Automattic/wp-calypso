import config from '@automattic/calypso-config';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { UnconnectedPageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import { getDSPOrigin, useDspOriginProps } from 'calypso/lib/promote-post';
import { getSiteFragment } from 'calypso/lib/route';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteMainProduct,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';

interface Props {
	path: string;
	title: string;
	delay?: number;
	properties?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	options?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// This component will pass through all properties to PageViewTracker unconnected component from the analytics library
// We do this to make it compatible with the Blaze Jetpack version of the dashboard that uses hashbang for navigation
const BlazePageViewTracker = ( props: Props ) => {
	const dspOriginProps = useDspOriginProps();
	return (
		<UnconnectedPageViewTracker
			{ ...props }
			properties={ { ...props.properties, origin: getDSPOrigin( dspOriginProps ) } }
		/>
	);
};

const mapStateToProps = ( state: Record< string, unknown > ) => {
	const isUserAuthenticated = getCurrentUserId( state );
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
	const currentSlug =
		typeof window === 'undefined' || config.isEnabled( 'is_running_in_jetpack_site' )
			? ''
			: getSiteFragment( get( window, 'location.pathname', '' ) );

	const hasSelectedSiteLoaded =
		! currentSlug ||
		( typeof currentSlug === 'number' && currentSlug === selectedSiteId ) ||
		currentSlug === selectedSiteSlug;

	return {
		hasSelectedSiteLoaded,
		selectedSiteId,
		isUserAuthenticated,
	};
};

const mapDispatchToProps = {
	recorder: withEnhancers( recordPageView, [ enhanceWithSiteType, enhanceWithSiteMainProduct ] ),
};

export default connect( mapStateToProps, mapDispatchToProps )( BlazePageViewTracker );
