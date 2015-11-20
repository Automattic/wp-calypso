Progress Indicator
=========

This component is used to display a progress indicator to the user.
The progress indicator lets the user know when an action is in progress,
has completed or has failed.

#### How to use:

```js
var ProgressIndicator = require( 'components/progress-indicator' );

render: function() {
    return (
		<ProgressIndicator state='inactive' key='unique-key' />
    );
}
```

#### Props

* `status`: Status can be one of the following: 'failed', 'success', 'complete', 'in-progress', 'processing', 'inactive'

  - `failed`      = Diplays a failed state to the user.
  - `success`     = Display the success action to the user.
  - `complete`    = Displays that the action is completed.
  - `in-progress` = Dispays that the action requested by the user is in progress. The progress indicator goes to 90% completion.
  - `processing`  = Display the progress indicatror as spinning.
  - `inactive`    = Hides the progress indicatior.

* `className`: Add your own class to the progress indicator for easier styling.


#### More examples
```js
<ProgressIndicator /> /* status should be hidden */
<ProgressIndicator status="success" />
<ProgressIndicator status="failed" />
<ProgressIndicator status="complete" />
<ProgressIndicator status="in-progress" />
<ProgressIndicator status="processing" />
<ProgressIndicator status="inactive" />

<ProgressIndicator status={ this.state.autoupdatingStatus } />

/* later somewhere */
this.setState( { autoupdatingStatus: 'success' } );
```
