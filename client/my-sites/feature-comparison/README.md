Feature Comparison
=========

This component is used to group plan-comparison-card

#### Usage:

```js
<FeatureComparison>
	<PlanCompareCard
		title="Free Plan"
		line="Free for life"
		buttonName="Your Plan"
		currentPlan={ true }>
		<PlanCompareCardItem highlight={ true }>
			3GB Space
		</PlanCompareCardItem>
		<PlanCompareCardItem unavailable={ true }>
			Custom Domain
		</PlanCompareCardItem>
		<PlanCompareCardItem unavailable={ true }>
			No Ads
		</PlanCompareCardItem>
		<PlanCompareCardItem unavailable={ true }>
			Custom Design
		</PlanCompareCardItem>
		<PlanCompareCardItem unavailable={ true }>
			VideoPress
		</PlanCompareCardItem>
	</PlanCompareCard>
	<PlanCompareCard
		title="Premium"
		line="$99 per year"
		buttonName="Upgrade"
		currentPlan={ false }
		popularRibbon={ true }>
		<PlanCompareCardItem highlight={ true }>
			13GB Space
		</PlanCompareCardItem>
		<PlanCompareCardItem>
			Custom Domain
		</PlanCompareCardItem>
		<PlanCompareCardItem>
			No Ads
		</PlanCompareCardItem>
		<PlanCompareCardItem>
			Custom Design
		</PlanCompareCardItem>
		<PlanCompareCardItem>
			VideoPress
		</PlanCompareCardItem>
	</PlanCompareCard>
</ButtonGroup>
```

#### Props

* `className`: A string that adds additional class names to this component.
