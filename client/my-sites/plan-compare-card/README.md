# Plan Compare Card

This component is used to display a current or next plan, highlighting the features you choose.

## Usage

```javascript
<PlanCompareCard title="Free Plan" line="Free for life" buttonName="Your Plan" currentPlan>
	<PlanCompareCardItem highlight>3GB Space</PlanCompareCardItem>
	<PlanCompareCardItem unavailable>Custom Domain</PlanCompareCardItem>
	<PlanCompareCardItem unavailable>No Ads</PlanCompareCardItem>
	<PlanCompareCardItem unavailable>Custom Design</PlanCompareCardItem>
	<PlanCompareCardItem unavailable>VideoPress</PlanCompareCardItem>
</PlanCompareCard>;
```

## Props

- `title`: The plan name (required)
- `line`: The plan tagline (required)
- `buttonName`: Button text (required)
- `currentPlan`: If the plan is current
- `onClick`: An on click handler that is fired when the plan button is clicked.
- `popularRibbon`: Displays the popular ribbon
- `className`: A string that adds additional class names to this component.
