/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const JetpackPlanDetails = ( { plan } ) => {
	return (
		<div>
			<p>{ plan.description }</p>

			<ul className="plan__plan-details-list">
				<li className="plan__plan-details-item"><Gridicon icon="checkmark" size={ 18 } />{ plan.feature_1 }</li>
				<li className="plan__plan-details-item"><Gridicon icon="checkmark" size={ 18 } />{ plan.feature_2 }</li>
				<li className="plan__plan-details-item"><Gridicon icon="checkmark" size={ 18 } />{ plan.feature_3 }</li>
			</ul>
		</div>
	);
};

JetpackPlanDetails.propTypes = {
	plan: React.PropTypes.object.isRequired
};

export default JetpackPlanDetails;
