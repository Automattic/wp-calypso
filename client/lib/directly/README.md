Directly
========

[Directly](https://www.directly.com/) is an on-demand customer support tool that we're
using to provide live chat support to unpaid customers. This module wraps the Directly
library and API to provide a modular interface to its global functions.

**Unless you have a very good reason, you should interact with Directly through [its
Redux interface](../../state/directly).**

## Usage

The following functions are exported from this module:

#### `initialize( config, callback )`

**This must be called before any other functions have any effect.**

Loads and configures the Directly library. All Directly assets will be downloaded
(about 200KB at the time of writing). This will also auto-open the Directly widget
for users who recently asked a question (an unavoidable part of the library's mount).

Configuration options can only be set once, so any tags/labels/etc you add will apply
to all Directly questions the user asks until the page reloads. After the first call
to `initialize` the function becomes a no-op.

Example:

```
import { initialize as initializeDirectly } from 'lib/directly';

const directlyConfig = {
	displayAskQuestion: true,
	questionCategory: 'bananaStand',
	customTags: [ 'ann', 'her?' ],
	metadata: {
		favoriteSong: 'The Final Countdown',
		preferredTransport: 'Segway',
	},
	userName: 'GOB Bluth',
	userEmail: 'gob@bluthcompany.com',
	labels: {
		askBubble: 'Ask\nour specialists',
		askButton: 'Submit your question',
	},
};

const directlyCallback = ( error ) => {
	if ( error ) {
		alert( 'I\'ve made a huge mistake...' );
	}
};

initializeDirectly( directlyConfig, directlyCallback );
```

`config` is an Object with these optional keys:
- `displayAskQuestion`: Boolean. Whether to display the ask form and widget by default or not. Default: `false`
- `questionCategory`: String. Category that will be assigned to the question asked.
- `customTags`: Array of strings. Tags that will be assigned to the question asked.
- `metadata`: Object. Key-Value metadata that will be assigned to the question asked.
- `userName`: String. The name that will be used to ask the question. Also, if present, the input field to enter user name won't be displayed.
- `userEmail`: String. The email address of the user who is asking the question. Also, if present, the input field to enter user email won't be displayed.
- `labels`: Object. The texts defined here will override the default text in the ask widget, the ask button and the header. Valid keys are `askBubble` and `askButton`.

The `callback` function is called when the Directly library loads or runs into an error. The `error` parameter will be `null` for successful load, and an error Object for load failure.


#### `askQuestion( { questionText, name, email } )`

Asks a question with the given params and open the "Alerting experts" view. Example:

```
import { askQuestion as askDirectlyQuestion } from 'lib/directly';

askDirectlyQuestion( {
	questionText: 'What have we always said is the most important thing?',
	name: 'Michael Bluth',
	email: 'michael@bluthcompany.com'
} );
```

#### `maximize()`
Maximizes the RTM widget to the full attached view. Example:

```
import { maximize as maximizeDirectly } from 'lib/directly';

maximizeDirectly();
```

#### `minimize()`
Minimizes the RTM widget to the Ask Bubble. Example:

```
import { minimize as minimizeDirectly } from 'lib/directly';

minimizeDirectly();
```

#### `openAskForm()`
Opens the ask form (or bubble). It only has effect if the `displayAskQuestion` setting
is false. Example:

```
import { openAskForm as openDirectlyAskForm } from 'lib/directly';

openDirectlyAskForm();
```

## A note on the integration code

The standard integration code from Directly assumes the library should be downloaded
on pageload with a snippet placed in the main HTML payload. Our use case is different,
so we had to heavily modify the standard code snippet. If Directly sends us new integration code
in the future, we'll need to review it thoroughly to understand how to modify our custom integration.
