# Upgrade Nudge Expanded

UpgradeNudgeExpanded displays a huge upgrade nudge, containing PlanCompare card, reasons to upgrade, highlighted feature and benefits of it.

It's meant to comprehensively describe a plan and give enough reasons to upgrade. It uses `plans/constants` information to figure out what features to present and how to direct to checkout.

## Props

- *plan* - PlanSlug of the plan that upgrade leads to. Required. That is the only required prop.
- *event* - event to distinguish the nudge in tracks. Used as `cta_name` event property.
- *title*
- *subtitle*
- *highlightedFeature* - slug of the feature to highlight in the plans compare card
- *benefits* - array of strings explaining the benefits of the feature and upgradidng to the plan
- *upgrade* - upgrade function. If not provided, default will be used.
- *eventName* - event to record when nudge is shown. Default is `calypso_upgrade_nudge_impression` with properties cta_name: props.event, cta_size: expanded and cta_feature: props.highlightedFeature
- *forceDisplay* - Used to display the update nudge in devdocs.


## Example - minimal

```jsx
<UpgradeNudgeExpanded
	plan={ PLAN_BUSINESS }
	title={ translate( 'Upgrade to a Business Plan and Enable Advanced SEO' ) }
	subtitle={ translate( 'By upgrading to a Business Plan you\'ll enable advanced SEO features on your site.' ) }
	highlightedFeature={ FEATURE_ADVANCED_SEO }
	benefits={ [
		translate( "Preview your site's posts and pages as they will appear when shared on Facebook, Twitter and the WordPress.com Reader." ),
		translate( 'Allow you to control how page titles will appear on Google search results, or when shared on social networks.' ),
		translate( 'Modify front page meta data in order to customize how your site appears to search engines.' )
	] }
/>
```
