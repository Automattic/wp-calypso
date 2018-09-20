This component is used to display an install bar for automated transfers.

#### How to use:

```js
import PluginAutomatedTransfer from 'my-sites/plugins/plugin-automated-transfer';

render: function() {
	return (
		<div className="plugin-meta">
			<PluginAutomatedTransfer
				plugin={ plugin }
			/>
		</div>
	);
}
```

#### Props:

* `plugin`: a plugin object.
