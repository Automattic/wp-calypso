PostStats
=========
This module provides an abstracted view into per-post stats.

Views use a common store described below:

### PostStatsStore
Handles data access and brokers the response payload into change events to which views subscribe.

This should work with pages as well (or anything else with a post ID -- like an attachment) so long as the REST API supports it.

#### How to use:

```js
var postStatsStore = require( 'lib/post-stats/store' );
/* Inside your stats component: */
	componentWillMount: function() {
		postStatsStore.on( 'change', this.handleChange );
	},

	componentWillUnmount: function() {
		postStatsStore.off( 'change', this.handleChange );
	},

	handleChange: function() {
		var totalViews = postStatsStore.getItem( 'totalViews', this.props.siteId, this.props.postId );
		/* ... update the component state if it differs ... */
	}
```
