Lodash Babel Transform
======================

This Babel transform transforms imports from the `lodash-es` module, commonly found in
third party NPM packages, into imports from `lodash`:

```js
import get from 'lodash-es/get'
```

is transformed into:

```js
import { get } from 'lodash'
```

This transform avoid duplication of the Lodash library and makes sure that all imports
from all packages are satisfied by the single global `lodash` module.
