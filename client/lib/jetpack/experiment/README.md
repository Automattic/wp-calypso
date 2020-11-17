# Jetpack Purchasable Items API (EXPERIMENTAL)

This API is intended to unify and normalize access to Jetpack bundles, products,
and legacy plans, eventually replacing several data sources with one canonical
source of truth.

## The problem

Currently, information for the items we make available to purchase lives in
several different places throughout the wp-calypso repository. Because of this,
we face lots of potential for code duplication, confusion about where to find
the data we're after, and inconsistency in our data when properties inevitably
change.

## This proposal

### Part 0: Terminology

We can't go any further without addressing a particularly long-lived elephant in
the room: pollution of terms.

With the introduction of the Offer Reset in 2020, "plans," "products," and
"bundles" all existed as separate and distinct, but very similar concepts. They
evolved organically over the years, but as their APIs intermingled they became
increasingly difficult to query and manipulate. To attempt to smooth this over,
the proposal here refers to all three as types of **purchasable item**. Sure,
it doesn't exactly roll off the tongue, but it gives us a common foundation from
which to start: products, bundles, and plans each have their own special
properties and behaviors, but they're all items in some sense.

### Part 1: Philosophy

First and foremost, the approach here is one of **simplicity** and
**modularity**. We're all human, and the number of concepts that we can fit into
our brains at one time ("headspace") is very limited. When we reach this limit,
we have to "swap out" information to think about what's at hand. The more
efficiently we can organize our thoughts, the less space gets wasted and the
less "swap" time our brains have to spend trying to remember where we left off
in our work or what needs to happen next.

* To reduce confusion and fragmentation, we've purposely made it so that there's
only one or two _obvious_ ways to get the information you're after, depending on
the situation. In most cases, all the data you'll need is reachable via a single
import or method call.
* Basic information is available by default for each item, but definitely not
the full range of properties we're used to. This API was created as a building
block, best used in concert with other building blocks (more on this in
**Part 3**).
* For advanced tasks and integrations, we'd rather people compose only the data
they need, from the sources that work the best for them. We've put together a
few examples of what this composition might look like -- see
**Example use cases**.

We also designed things to allow for a slow, seamless transition from what we're
doing currently, because switching from one system to another all at once is a
risky bet. We believe it's safer to slowly adapt and improve, borrowing from
what already exists and porting over the bits we want to save. In this first
implementation you'll see lots of references to old constants; eventually, we
expect to remove those references and replace them with the actual data they
hold.

### Part 2: Structure

The API is structured as follows. With this approach to organization, the hope
is to make it easier to inspect or modify existing items, as well as make it
obvious where to add new ones:

- **`purchasable-items/`**: Basic item information
  - **`bundles/`**: Bundles like Jetpack Security and Jetpack Complete, which
  "contain" multiple individual products
  - **`legacy-plans/`**: Plans that still exist but are no longer made publicly
  available for purchase (e.g., Jetpack Personal)
  - **`products/`**: Individual products, like Jetpack Backup and Jetpack Scan
  - `attributes.ts`: Defines the limited set of intrinsic attributes that can be
  attached to a purchasable item (more on this in **Part 3**)
  - `index.ts`: Exposes item collections for convenience, methods to query
  across all items by various criteria, and functions to decorate items with
  more information
  - `types.d.ts`: Defines all relevant top-level item types

We recommend that decorators implemented in the future be located as close to
where they're used as possible, and that they follow a similar structure to the
core API. This pattern should lower the cognitive burden to find and update
code, ensuring we don't fall into the same traps as before.

### Part 3: Architecture

#### TypeScript

To create a strong foundation with obvious data contracts, and to take advantage
of auto-completion where it's available, the core API is built on TypeScript.
Every item has a set of properties that are guaranteed to exist, and those
property values are guaranteed not to change.

#### A minimal, stable core

The core API exposes all products, bundles, and plans, but we only describe them
in the most basic terms.

More concretely: a `PurchasableItem` consists of a slug and a limited set of
intrinsic attributes: whether it's an individual product, a bundle, or a
legacy plan; which family of items it belongs to; its billing term; and whether
it exists as a daily or real-time variant. Attributes are the small set of
things we believe make an item unique among its peers, with all other
information being supplemental.

In keeping the API's surface area small, it should be easier to reason about and
relatively stable over time, making it a reliable foundation on which to build.

#### Small, intuitive files

Instead of massive files full of constants like we're used to currently, this
implementation puts items into separate files along clear boundaries. For
example: in our existing codebase if I need to learn more about or make changes
to the Security Daily bundle, I might find myself looking through several files
across a few different directories; but in the API proposed here, I can find all
of this item's basic information in one file labeled `security-daily.ts`.

### Separate concerns, kept separated

Our existing code tends to group item data by field (e.g.,
`getJetpackProductShortNames`) or roughly by item type (e.g., plans and bundles
are mostly described in the `client/lib/plans` directory). While this approach
gets the job done, it also means finding information about one item -- or
even one type of item -- could span across a host of methods and dictionary
lookups.

Our approach in this API contrasts, in that we treat items themselves as
first-class objects. The implicit assumption here is that while making changes
to an existing item or family of items is relatively common, making the same
sort of change to every product's tagline or display name happens much less
often.

On the same note, continuing from what we said about **a minimal, stable core**,
properties that aren't intrinsic to items themselves will be kept as close as
possible to where they're needed, in similar item-centric groups. Following
along from the previous example, I should be able to find auxiliary properties
for the Security Daily bundle near where those properties are used, in a file
that's also called `security-daily.ts(x)`.

We include examples in this proposal for "display" properties (e.g., display
names, taglines, etc.) and item-specific React selectors, which are both useful
groupings but at the same time are definitely not foundational to any item's
identity and tend to change much more often than, say, a slug.

## Example use cases

### Get all individual products/bundles/legacy plans

```ts
import { Products, Bundles, LegacyPlans } from 'calypso/lib/jetpack/experiment/purchasable-items';
```

### Get one or more specific items by importing them directly

```ts
import { SearchAnnual } from 'calypso/lib/jetpack/experiment/purchasable-items/products';
import { ProfessionalMonthly } from 'calypso/lib/jetpack/experiment/purchasable-items/legacy-plans';
```

### Get an item by its slug

```ts
import { getItemBySlug } from 'calypso/lib/jetpack/experiment/purchasable-items';
import type { PurchasableItem } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const completeBundleAnnual: PurchasableItem = getItemBySlug( 'jetpack_complete' );
```

### Get all items matching a set of criteria

```ts
import { Attributes, getItemsWithAttributes } from 'calypso/lib/jetpack/experiment/purchasable-items';
import type { PurchasableItem, PurchasableBundle } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const allAnnualItems: PurchasableItem[] = getItemsWithAttributes( {
	billingTerm: Attributes.BillingTerm.ANNUAL,
} );
const allMonthlyBundles: PurchasableBundle[] = getItemsWithAttributes( {
	itemType: Attributes.ItemType.BUNDLE,
	billingTerm: Attributes.BillingTerm.MONTHLY,
} ) as PurchasableBundle[];
```

### Get an item by its attributes
```ts
import { Attributes, getOnlyItemWithAttributes } from 'calypso/lib/jetpack/experiment/purchasable-items';
import type { PurchasableItem } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const antispamMonthly: PurchasableItem = getOnlyItemWithAttributes( {
	family: 'jetpack_anti_spam',
	billingTerm: Attributes.BillingTerm.MONTHLY,
} );
```

### Convert between monthly to yearly billing terms

```ts
import {
	getItemBySlug,
	getItemBilledMonthly,
	getItemBilledAnnually,
} from 'calypso/lib/jetpack/experiment/purchasable-items';
import type { PurchasableItem } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const backupAnnual: PurchasableItem = getItemBySlug( 'jetpack_backup_daily' );
const backupMonthly: PurchasableItem = getItemBilledMonthly( backupAnnual.slug );
const backupAnnualAgain: PurchasableItem = getItemBilledAnnually( backupMonthly.slug );
```

### Convert between daily and real-time options

```ts
import { Attributes, getItemBySlug, getOnlyRelatedItem } from 'calypso/lib/jetpack/experiment/purchasable-items';
import type { PurchasableItem } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const securityDaily: PurchasableItem = getItemBySlug( 'jetpack_security_daily' );
const securityRealtime: PurchasableItem = getOnlyRelatedItem(
	securityDaily, { dailyOrRealtime: Attributes.DailyRealtimeOption.REALTIME }
);
const securityDailyAgain: PurchasableItem = getOnlyRelatedItem(
	securityRealtime, { dailyOrRealtime: Attributes.DailyRealtimeOption.DAILY }
);
```

### Safely check and smartly cast an item of an unknown type to a specific type

```ts
import { getItemBySlug, isBundle } from 'calypso/lib/jetpack/experiment/purchasable-items';
import type { PurchasableItem } from 'calypso/lib/jetpack/experiment/purchasable-items/types';

const securityDailyAnnual: PurchasableItem = getItemBySlug( 'jetpack_security_daily' );
if ( isBundle( securityDailyAnnual ) ) {
	// isBundle is a type predicate for PurchasableBundle; so,
	// everything in this block can safely assume that securityDailyAnnual
	// is a PurchasableBundle and has all that type's members
	const includedSlugs: string[] = shouldBeABundle.includedProducts.map( p => p.slug );
	console.log( includedSlugs.join( ',' ) );
}
```

### Compose an item with extra properties

```tsx
import React from 'react';
import { useSelector } from 'react-redux';

import { decorateItem } from 'calypso/lib/jetpack/experiment/purchasable-items';
import { BackupRealtimeAnnual } from 'calypso/lib/jetpack/experiment/purchasable-items/products';
import { withDisplayProperties } from 'calypso/lib/jetpack/experiment/purchasable-items-examples/display';
import type { DisplayableItem } from 'calypso/lib/jetpack/experiment/purchasable-items-examples/display/types';
import { withSelectors, SelectableItem } from 'calypso/lib/jetpack/experiment/purchasable-items-examples/selectors';

const decoratedBackup = decorateItem(
	BackupRealtimeAnnual, [ withDisplayProperties, withSelectors ]
) as DisplayableItem & SelectableItem;
const ExampleComponent = () => {
	const cost = useSelector( decoratedBackup.getBillingAmount );
	return (
		<span>
			{ `${ decoratedBackup.displayName } costs ${ cost }` }
		</span>
	);
};
```

### Compose an array of items with extra properties

```ts
import { decorateItems, Products } from 'calypso/lib/jetpack/experiment/purchasable-items';
import { withDisplayProperties } from 'calypso/lib/jetpack/experiment/purchasable-items-examples/display';
import type { DisplayableItem } from 'calypso/lib/jetpack/experiment/purchasable-items-examples/display/types';

const ProductsList = Object.values( Products );
const productsWithDisplayProps = decorateItems(
	ProductsList, [ withDisplayProperties ]
) as DisplayableItem[];
```
