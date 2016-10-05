// External dependencies
import React, { PropTypes } from 'react';

// Internal dependencies
import { cartItems } from 'lib/cart-values';
import PlansStep from 'signup/steps/plans';

const GetDotBlogPlansStep = ( { queryObject, ...props } ) => (
	<PlansStep
		additionalStepData={ {
			isPurchasingItem: true,
			domainItem: cartItems.domainMapping( { domain: queryObject.domain } ),
			siteUrl: queryObject.domain.replace( /\W+/g, '' )
		} }
		{ ...props }
		hideFreePlan
	/>
);

GetDotBlogPlansStep.propTypes = {
	queryObject: PropTypes.object.isRequired,
};

export default GetDotBlogPlansStep;
