/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { FunctionComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { hasFeature } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Types
 */
interface ConnectedProps {
	hasPlanFeature: boolean;
}

interface ExternalProps {
	feature: string;
	hasFeatureContent: ReactNode; // Content to show when plan covers the feature.
	noFeatureContent: ReactNode; // Content shown when plan doesn't cover the feature.
}

const PlanGate: FunctionComponent< ConnectedProps & ExternalProps > = ( {
	hasPlanFeature,
	hasFeatureContent,
	noFeatureContent,
} ) => {
	return hasPlanFeature ? hasFeatureContent : noFeatureContent;
};

export default connect< ConnectedProps, {}, ExternalProps >( ( state, { feature } ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		hasPlanFeature: selectedSiteId ? hasFeature( state, selectedSiteId, feature ) : null,
	};
} )( PlanGate );
