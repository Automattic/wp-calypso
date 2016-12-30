site-stats-sticky-tab
=====================

`siteStatsStickyTab` is a set of Flux-style modules used to maintain an in-memory (backed by `localStorage`) store of the last Site Stats filter and site-specificity state.

This enables us to provide direct links to where users were inside their Site Stats previously.

### usage
* To save the state:

```es6
var siteStatsStickyTabActions = require( 'lib/site-stats-sticky-tab/actions' );
/* ...component lifecycle methods: */
{
	componentDidMount: function() {
		siteStatsStickyTabActions.saveFilterAndSlug( this.getActiveFilter().id, this.props.site.slug );
	},

	componentDidUpdate: function() {
		siteStatsStickyTabActions.saveFilterAndSlug( this.getActiveFilter().id, this.props.site.slug );
	},
}
```

* Displaying the link is handled by the `site-stats-sticky-link` component
