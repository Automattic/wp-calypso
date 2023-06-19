import HappinessSupport from 'calypso/components/happiness-support';

export const HappinessSupportCard = ( {
	isFeatureCard,
	isJetpack,
	isJetpackFreePlan,
	isPlaceholder,
	contactButtonEventName,
} ) => (
	<div className="product-purchase-features-list__item">
		<HappinessSupport
			isFeatureCard={ isFeatureCard }
			isJetpack={ isJetpack }
			isJetpackFreePlan={ isJetpackFreePlan }
			isPlaceholder={ isPlaceholder }
			contactButtonEventName={ contactButtonEventName }
		/>
	</div>
);

export default HappinessSupportCard;
