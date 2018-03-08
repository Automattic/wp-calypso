/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import HappinessSupport from 'components/happiness-support';

export default ( { isFeatureCard, isJetpack, isJetpackFreePlan, showLiveChatButton } ) => (
	<div className="product-purchase-features-list__item">
		<div className="product-purchase-features-list__item-hc">
			<HappinessSupport
				isFeatureCard={ isFeatureCard }
				isJetpack={ isJetpack }
				isJetpackFreePlan={ isJetpackFreePlan }
				showLiveChatButton={ showLiveChatButton }
				liveChatButtonEventName="calypso_plans_current_plan_chat_initiated"
			/>
		</div>
	</div>
);
