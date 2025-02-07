# Site Admin Meta Helper

Returns the name, description, and version of the Site Admin package.

## Usage
```typescript
import { getMeta } from '@automattic/site-admin';

const meta = getMeta();
console.log(`The package version is ${meta.version}`);
```