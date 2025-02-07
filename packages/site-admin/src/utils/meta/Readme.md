# Site Admin Meta Helper

Returns the name, description, and version of the Site Admin package.

## Usage
```typescript
import { getSiteAdminMeta } from '@automattic/site-admin';

const meta = getSiteAdminMeta();
console.log(`The package version is ${meta.version}`);
```