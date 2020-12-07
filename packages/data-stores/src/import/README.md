# Import store

This store includes behavior for importing an the content of an externally hosted site.

## Usage

Register the user store, passing in a valid client ID and secret:

```js
import { Import } from '@automattic/data-stores';

const IMPORT_STORE = Import.register();
```
