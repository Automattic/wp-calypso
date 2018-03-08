/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import HappinessSupport from 'components/happiness-support';

export default ( { isJetpack, isJetpackFreePlan, showLiveChatButton } ) => (
	<div className="product-purchase-features-list__item ">
		<HappinessSupport
			isJetpack={ isJetpack }
			isJetpackFreePlan={ isJetpackFreePlan }
			showLiveChatButton={ showLiveChatButton }
			liveChatButtonEventName="calypso_plans_current_plan_chat_initiated"
		/>
	</div>
);
