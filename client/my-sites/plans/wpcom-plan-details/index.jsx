/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

const WpcomPlanDetails = ( { comparePlansUrl, handleLearnMoreClick, plan } ) => {
	return (
		<div>
			<p>{ plan.description }</p>

			<a href={ comparePlansUrl }
				onClick={ handleLearnMoreClick }
				className="plan__learn-more">
				{ i18n.translate( 'Learn more', { context: 'Find out more details about a plan' } ) }
			</a>
		</div>
	);
};

WpcomPlanDetails.propTypes = {
	comparePlansUrl: React.PropTypes.string.isRequired,
	handleLearnMoreClick: React.PropTypes.func.isRequired,
	plan: React.PropTypes.object.isRequired
};

export default WpcomPlanDetails;
