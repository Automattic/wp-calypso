/**
 * External dependencies
 */
import React from 'react';

const JetpackPlanDetails = ( { plan } ) => {
	return (
		<div>
			<p>{ plan.description }</p>

			<ul>
				<li>{ plan.feature_1 }</li>
				<li>{ plan.feature_2 }</li>
				<li>{ plan.feature_3 }</li>
			</ul>
		</div>
	);
};

JetpackPlanDetails.propTypes = {
	plan: React.PropTypes.object.isRequired
};

export default JetpackPlanDetails;
