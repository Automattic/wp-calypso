Plan Card
==============

This component is used to display a current or next plan, highlighting the features you choose.

#### Usage:

```javascript
	<PlanCard
		title="Free Plan"
		line="Free for life"
		buttonName="Your Plan"
		currentPlan={ true }>
		<PlanCardItem highlight={ true }>
			3GB Space
		</PlanCardItem>
		<PlanCardItem unavailable={ true }>
			Custom Domain
		</PlanCardItem>
		<PlanCardItem unavailable={ true }>
			No Ads
		</PlanCardItem>
		<PlanCardItem unavailable={ true }>
			Custom Design
		</PlanCardItem>
		<PlanCardItem unavailable={ true }>
			VideoPress
		</PlanCardItem>
	</PlanCard>
	
	<PlanCard
		title="Premium"
		line="$99 per year"
		buttonName="Upgrade"
		currentPlan={ false }
		popularRibbon={ true }>
		<PlanCardItem highlight={ true }>
			13GB Space
		</PlanCardItem>
		<PlanCardItem>
			Custom Domain
		</PlanCardItem>
		<PlanCardItem>
			No Ads
		</PlanCardItem>
		<PlanCardItem>
			Custom Design
		</PlanCardItem>
		<PlanCardItem>
			VideoPress
		</PlanCardItem>
	</PlanCard>
}
```

#### Props

* `title`: The plan name (required)
* `line`: The plan tagline (required)
* `buttonName`: Button text (required)
* `currentPlan`: If the plan is current
* `onClick`: An on click handler that is fired when the plan button is clicked.
* `popularRibbon`: Displays the popular ribbon
* `className`: A string that adds additional class names to this component.
