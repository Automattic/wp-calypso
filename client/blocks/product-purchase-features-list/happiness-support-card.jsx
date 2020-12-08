/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HappinessSupport from 'calypso/components/happiness-support';

export const HappinessSupportCard = ( {
	isFeatureCard,
	isJetpack,
	isJetpackFreePlan,
	isPlaceholder,
	liveChatButtonEventName,
	showLiveChatButton,
} ) => (
	<div className="product-purchase-features-list__item">
		<HappinessSupport
			isFeatureCard={ isFeatureCard }
			isJetpack={ isJetpack }
			isJetpackFreePlan={ isJetpackFreePlan }
			isPlaceholder={ isPlaceholder }
			showLiveChatButton={ showLiveChatButton }
			liveChatButtonEventName={ liveChatButtonEventName }
		/>
	</div>
);

export default HappinessSupportCard;
