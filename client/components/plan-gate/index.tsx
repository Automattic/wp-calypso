/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { FunctionComponent } from 'react';

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
	children: JSX.Element[];
}

const PlanGate: FunctionComponent< ConnectedProps & ExternalProps > = ( {
	hasPlanFeature,
	children,
} ) => {
	if ( hasPlanFeature ) {
		return children[ 1 ];
	}

	return children[ 0 ];
};

export default connect< ConnectedProps, {}, ExternalProps >( ( state, { feature } ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		hasPlanFeature: selectedSiteId ? hasFeature( state, selectedSiteId, feature ) : false,
	};
} )( PlanGate );
