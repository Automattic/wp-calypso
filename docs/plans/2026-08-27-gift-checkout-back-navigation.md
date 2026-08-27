# Gift Checkout Back Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the "< Back" link in gift checkout (`/checkout/<plan>/gift/<subscription_id>`) return the visitor to the gifted site instead of `/home` (own-site WP Admin when logged in, login page when logged out). Linear: DOTOBRD-600.

**Architecture:** A pure helper `getGiftCheckoutBackUrl` picks `document.referrer` when its host matches the cart's server-provided `gift_details.receiver_blog_url`, otherwise the receiver URL, otherwise `undefined`. `useCheckoutLeaveModal` feeds that result in as the *last* fallback of `forceCheckoutBackUrl`, which `leaveCheckout` already checks before the banner's hardcoded `cancel_to=/home`. No changes to `leaveCheckout`, the masterbar, or wpcom.

**Tech Stack:** TypeScript, React hook, Jest + `@testing-library/react` (jsdom), `@automattic/shopping-cart` test helpers, Playwright E2E (`test/e2e`).

Design doc: `docs/plans/2026-08-27-gift-checkout-back-navigation-design.md`.

---

## Environment notes (read first)

- This is an emdash worktree without `node_modules`. Every shell command must prefix Node 24:
  `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"` — verify with `node -v` → `v24.15.0`.
- Husky hooks are not installed here: commit with `git commit --no-verify`.
- Do **not** commit `.gitignore` (pre-existing emdash change). Always `git add` explicit paths.
- Preserve curly quotes/apostrophes exactly as found in source strings (repo CLAUDE.md).
- No narrating comments in code (AGENTS.md); the PR description carries the rationale.

---

### Task 0: Install dependencies in the worktree

**Files:** none

**Step 1: Install**

Run (≈3 min, ≈1.9 GB):
```bash
export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"
cd /Users/paulotrentin/emdash/worktrees/wp-calypso-default/emdash/fix-onboarding-back-9g4se
node -v && yarn install
```
Expected: ends without error; `ls node_modules/.bin/jest` prints the path. Warnings like "wp-calypso@workspace must be built" are noise.

If disk is tight, the regenerable legacy cache `~/Library/Caches/Yarn` can be deleted (not `~/.yarn`).

**Step 2: Sanity-run the existing modal test**

```bash
yarn test-client client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx
```
Expected: PASS (6 tests). If it fails on environment grounds, fix the environment before continuing.

---

### Task 1: `getGiftCheckoutBackUrl` helper (TDD)

**Files:**
- Create: `client/my-sites/checkout/src/lib/get-gift-checkout-back-url.ts`
- Test: `client/my-sites/checkout/src/lib/test/get-gift-checkout-back-url.ts`

**Step 1: Write the failing tests**

```ts
/**
 * @jest-environment jsdom
 */
import { getGiftCheckoutBackUrl } from '../get-gift-checkout-back-url';

const giftDetails = {
	receiver_blog_id: 123,
	receiver_blog_slug: 'giftedsite.wordpress.com',
	receiver_blog_url: 'https://giftedsite.wordpress.com',
};

describe( 'getGiftCheckoutBackUrl', () => {
	it( 'returns undefined when the cart has no gift details', () => {
		expect(
			getGiftCheckoutBackUrl( { giftDetails: undefined, referrer: 'https://giftedsite.wordpress.com/' } )
		).toBeUndefined();
	} );

	it( 'returns undefined when gift details have no receiver URL', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { receiver_blog_id: 123 },
				referrer: 'https://giftedsite.wordpress.com/',
			} )
		).toBeUndefined();
	} );

	it( 'returns the referrer when its host matches the gifted site', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails,
				referrer: 'https://giftedsite.wordpress.com/2026/08/27/hello-world/',
			} )
		).toBe( 'https://giftedsite.wordpress.com/2026/08/27/hello-world/' );
	} );

	it( 'returns the receiver URL when the referrer is on another host', () => {
		expect(
			getGiftCheckoutBackUrl( { giftDetails, referrer: 'https://evil.example.com/' } )
		).toBe( 'https://giftedsite.wordpress.com' );
	} );

	it( 'returns the receiver URL when the referrer is on a subdomain of the gifted host', () => {
		expect(
			getGiftCheckoutBackUrl( { giftDetails, referrer: 'https://sub.giftedsite.wordpress.com/' } )
		).toBe( 'https://giftedsite.wordpress.com' );
	} );

	it( 'returns the receiver URL when there is no referrer', () => {
		expect( getGiftCheckoutBackUrl( { giftDetails, referrer: '' } ) ).toBe(
			'https://giftedsite.wordpress.com'
		);
	} );

	it( 'returns the receiver URL when the referrer is not http(s)', () => {
		expect(
			getGiftCheckoutBackUrl( { giftDetails, referrer: 'javascript:alert(1)' } )
		).toBe( 'https://giftedsite.wordpress.com' );
	} );

	it( 'returns undefined when the receiver URL cannot be parsed', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { ...giftDetails, receiver_blog_url: 'not a url' },
				referrer: 'https://giftedsite.wordpress.com/',
			} )
		).toBeUndefined();
	} );
} );
```

**Step 2: Run the test to verify it fails**

```bash
yarn test-client client/my-sites/checkout/src/lib/test/get-gift-checkout-back-url.ts
```
Expected: FAIL — `Cannot find module '../get-gift-checkout-back-url'`.

**Step 3: Write the implementation**

```ts
import type { ResponseCartGiftDetails } from '@automattic/shopping-cart';

const HTTP_PROTOCOLS = [ 'http:', 'https:' ];

function parseHttpUrl( value: string | undefined ): URL | undefined {
	if ( ! value ) {
		return undefined;
	}
	try {
		const url = new URL( value );
		return HTTP_PROTOCOLS.includes( url.protocol ) ? url : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Where "Back" should go from a gift checkout: the page on the gifted site
 * the visitor came from when the referrer belongs to that site, otherwise
 * the gifted site itself. The referrer is only trusted when its host matches
 * the receiver URL the server put on the cart.
 */
export function getGiftCheckoutBackUrl( {
	giftDetails,
	referrer,
}: {
	giftDetails: ResponseCartGiftDetails | undefined;
	referrer: string;
} ): string | undefined {
	const receiverUrl = parseHttpUrl( giftDetails?.receiver_blog_url );
	if ( ! receiverUrl ) {
		return undefined;
	}

	const referrerUrl = parseHttpUrl( referrer );
	if ( referrerUrl && referrerUrl.host === receiverUrl.host ) {
		return referrerUrl.href;
	}

	return giftDetails?.receiver_blog_url;
}
```

Check that `ResponseCartGiftDetails` is exported from `@automattic/shopping-cart`:
```bash
grep -n "ResponseCartGiftDetails" packages/shopping-cart/src/index.ts packages/shopping-cart/src/types.ts
```
If `index.ts` re-exports `* from './types'` (it does for other cart types), the import works. Otherwise import the type via `import type { ResponseCart } from '@automattic/shopping-cart'` and use `ResponseCart[ 'gift_details' ]`.

**Step 4: Run the test to verify it passes**

```bash
yarn test-client client/my-sites/checkout/src/lib/test/get-gift-checkout-back-url.ts
```
Expected: PASS, 8 tests.

**Step 5: Commit**

```bash
git add client/my-sites/checkout/src/lib/get-gift-checkout-back-url.ts client/my-sites/checkout/src/lib/test/get-gift-checkout-back-url.ts
git commit --no-verify -m "Checkout: add getGiftCheckoutBackUrl helper"
```

---

### Task 2: Wire the helper into `useCheckoutLeaveModal` (TDD)

**Files:**
- Modify: `client/my-sites/checkout/src/components/leave-checkout-modal.tsx:12-60`
- Test: `client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx`

**Step 1: Extend the fake cart backend to carry `gift_details`**

In the test file, `createFakeCartBackend( initialCarts )` (≈line 68) only takes products per key. Change its signature so a key can map to either a product array (existing callers) or a partial cart:

```ts
type FakeCartSeed = ResponseCartProduct[] | Partial< ResponseCart >;

function createFakeCartBackend( initialCarts: Partial< Record< CartKey, FakeCartSeed > > ) {
	const carts = new Map< CartKey, ResponseCart >();
	for ( const [ key, seed ] of Object.entries( initialCarts ) ) {
		const cartKey = ( isNaN( Number( key ) ) ? key : Number( key ) ) as CartKey;
		const overrides: Partial< ResponseCart > = Array.isArray( seed )
			? { products: seed }
			: seed ?? {};
		carts.set( cartKey, {
			...getEmptyResponseCart(),
			cart_key: cartKey,
			products: [],
			...overrides,
		} );
	}
	// rest unchanged
```

Also make `setCart` preserve `gift_details` from the existing cart so the "clear cart" path still knows it is a gift cart:

```ts
	const setCart: SetCart = async ( cartKey, newCart: RequestCart ) => {
		setCallsByKey.push( cartKey );
		const existing = carts.get( cartKey );
		const updated: ResponseCart = {
			...getEmptyResponseCart(),
			cart_key: cartKey,
			gift_details: existing?.gift_details,
			is_gift_purchase: existing?.is_gift_purchase,
			products: /* unchanged mapping */,
		};
```

Run the existing suite to confirm nothing regressed:
```bash
yarn test-client client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx
```
Expected: PASS, 6 tests.

**Step 2: Write the failing gift tests**

Append to the test file:

```ts
describe( 'useCheckoutLeaveModal gift checkout', () => {
	const GIFT_CART_KEY: CartKey = 'no-site';
	const giftDetails = {
		receiver_blog_id: 123,
		receiver_blog_slug: 'giftedsite.wordpress.com',
		receiver_blog_url: 'https://giftedsite.wordpress.com',
	};
	const originalReferrer = Object.getOwnPropertyDescriptor( Document.prototype, 'referrer' );

	function setReferrer( value: string ) {
		Object.defineProperty( document, 'referrer', { value, configurable: true } );
	}

	beforeEach( () => {
		( useCartKey as jest.Mock ).mockReset();
		( useValidCheckoutBackUrl as jest.Mock ).mockReset();
		( leaveCheckout as jest.Mock ).mockReset();
		( useCartKey as jest.Mock ).mockReturnValue( GIFT_CART_KEY );
		( useValidCheckoutBackUrl as jest.Mock ).mockReturnValue( undefined );
	} );

	afterEach( () => {
		if ( originalReferrer ) {
			Object.defineProperty( Document.prototype, 'referrer', originalReferrer );
		}
		delete ( document as { referrer?: string } ).referrer;
	} );

	async function renderGiftHook( seed: Partial< ResponseCart > ) {
		const { getCart, setCart } = createFakeCartBackend( { [ GIFT_CART_KEY ]: seed } );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );
		const rendered = renderHook( () => useCheckoutLeaveModal( { siteUrl: '' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () =>
			expect( client.forCartKey( GIFT_CART_KEY ).getState().responseCart.gift_details ).toEqual(
				seed.gift_details
			)
		);
		return rendered;
	}

	it( 'sends Back to the referring page on the gifted site', async () => {
		setReferrer( 'https://giftedsite.wordpress.com/2026/08/27/hello-world/' );
		const { result } = await renderGiftHook( { gift_details: giftDetails, is_gift_purchase: true } );

		await act( async () => {
			result.current.clickClose();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				forceCheckoutBackUrl: 'https://giftedsite.wordpress.com/2026/08/27/hello-world/',
			} )
		);
	} );

	it( 'sends Back to the gifted site when the referrer is elsewhere', async () => {
		setReferrer( '' );
		const { result } = await renderGiftHook( { gift_details: giftDetails, is_gift_purchase: true } );

		await act( async () => {
			result.current.clickClose();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( { forceCheckoutBackUrl: 'https://giftedsite.wordpress.com' } )
		);
	} );

	it( 'sends Back to the gifted site after emptying the cart', async () => {
		setReferrer( '' );
		const { result } = await renderGiftHook( {
			gift_details: giftDetails,
			is_gift_purchase: true,
			products: [ planProduct ],
		} );

		await act( async () => {
			await result.current.clearCartAndLeave();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				userHasClearedCart: true,
				forceCheckoutBackUrl: 'https://giftedsite.wordpress.com',
			} )
		);
	} );

	it( 'lets an explicit checkoutBackUrl win over the gifted site', async () => {
		setReferrer( 'https://giftedsite.wordpress.com/' );
		( useValidCheckoutBackUrl as jest.Mock ).mockReturnValue( 'https://wordpress.com/plans/explicit' );
		const { result } = await renderGiftHook( { gift_details: giftDetails, is_gift_purchase: true } );

		await act( async () => {
			result.current.clickClose();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( { forceCheckoutBackUrl: 'https://wordpress.com/plans/explicit' } )
		);
	} );

	it( 'leaves non-gift carts alone', async () => {
		setReferrer( 'https://giftedsite.wordpress.com/' );
		const { result } = await renderGiftHook( {} );

		await act( async () => {
			result.current.clickClose();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( { forceCheckoutBackUrl: undefined } )
		);
	} );
} );
```

Note for `renderGiftHook( {} )`: `waitFor` compares `gift_details` to `undefined`; `getEmptyResponseCart()` has no `gift_details`, so this resolves once the cart is hydrated.

**Step 3: Run to verify the new tests fail**

```bash
yarn test-client client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx
```
Expected: the first three gift tests FAIL (`forceCheckoutBackUrl: undefined`); "explicit wins" and "non-gift" PASS already.

**Step 4: Implement in the hook**

In `leave-checkout-modal.tsx`:

```ts
import { getGiftCheckoutBackUrl } from '../lib/get-gift-checkout-back-url';
```

After `const { responseCart, replaceProductsInCart } = useShoppingCart( cartKey );`:

```ts
	const giftBackUrl = getGiftCheckoutBackUrl( {
		giftDetails: responseCart.gift_details,
		referrer: document.referrer,
	} );
```

In `closeAndLeave`, change the `forceCheckoutBackUrl` line to:

```ts
			forceCheckoutBackUrl:
				options?.forceBackUrl ?? stepBackUrl ?? forceCheckoutBackUrl ?? giftBackUrl,
```

Nothing else changes; `clearCartAndLeave` already routes through `closeAndLeave`.

**Step 5: Run the suite**

```bash
yarn test-client client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx
```
Expected: PASS, 11 tests.

**Step 6: Commit**

```bash
git add client/my-sites/checkout/src/components/leave-checkout-modal.tsx client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx
git commit --no-verify -m "Checkout: send gift checkout Back to the gifted site (DOTOBRD-600)"
```

---

### Task 3: Type-check and lint

**Files:** none new

**Step 1: Lint the touched files**

```bash
yarn eslint client/my-sites/checkout/src/lib/get-gift-checkout-back-url.ts client/my-sites/checkout/src/lib/test/get-gift-checkout-back-url.ts client/my-sites/checkout/src/components/leave-checkout-modal.tsx client/my-sites/checkout/src/components/test/leave-checkout-modal.test.tsx
```
Expected: no output. Fix anything reported (Prettier via `yarn prettier --write <file>`).

**Step 2: Type-check the client**

```bash
NODE_OPTIONS="--max-old-space-size=8192" yarn typecheck-client 2>&1 | tail -40
```
Expected: 0 errors in the four touched files. `TS2307 Cannot find module '@automattic/omnibar'` / `'@automattic/date-range-picker'` are unbuilt-workspace noise in a fresh worktree — ignore only those.

**Step 3: Commit any lint/type fixes**

```bash
git add -p client/my-sites/checkout
git commit --no-verify -m "Checkout: lint fixes for gift back URL"
```
(Skip if there is nothing to commit.)

---

### Task 4: E2E spec (best effort)

**Files:**
- Create: `test/e2e/specs/plans/plans__gift-checkout-back.spec.ts`

Read `test/e2e/AGENTS.md` and `test/e2e/docs/writing_tests.md` before writing.

**Step 1: Write the spec**

```ts
import { RestAPIClient, DataHelper } from '@automattic/calypso-e2e';
import { tags, test, expect } from '../../lib/pw-base';

test.describe( 'Plans: Gift checkout Back navigation', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	test( 'As a visitor, clicking Back in gift checkout returns me to the gifted site', async ( {
		accountDefaultUser,
		page,
		pageIncognito,
	} ) => {
		const siteUrl = accountDefaultUser.getSiteURL( { protocol: true } );
		const siteSlug = accountDefaultUser.getSiteURL( { protocol: false } );
		let giftCheckoutUrl = '';

		await test.step( 'Given the site has a plan subscription that can be gifted', async function () {
			const restAPIClient = new RestAPIClient( accountDefaultUser.credentials );
			const purchases = await restAPIClient.getAllPurchases( siteSlug );
			const plan = purchases.find( ( purchase ) => purchase.product_slug.includes( 'bundle' ) );
			test.skip( ! plan, `No plan purchase found on ${ siteSlug }` );
			giftCheckoutUrl = DataHelper.getCalypsoURL( `checkout/${ plan!.product_slug }/gift/${ plan!.ID }`, {
				cancel_to: '/home',
			} );
		} );

		await test.step( 'When I open gift checkout from the site while logged in and click Back', async function () {
			await accountDefaultUser.authenticate( page );
			await page.goto( giftCheckoutUrl, { referer: siteUrl } );
			await page.getByRole( 'button', { name: 'Back' } ).click();
		} );

		await test.step( 'Then I land on the gifted site', async function () {
			await expect( page ).toHaveURL( new RegExp( `^${ siteUrl.replace( /\/$/, '' ) }` ) );
		} );

		await test.step( 'When I open gift checkout from the site while logged out and click Back', async function () {
			const incognito = pageIncognito.getPage();
			await incognito.goto( giftCheckoutUrl, { referer: siteUrl } );
			await incognito.getByRole( 'button', { name: 'Back' } ).click();
			await expect( incognito ).toHaveURL( new RegExp( `^${ siteUrl.replace( /\/$/, '' ) }` ) );
		} );
	} );
} );
```

**Step 2: Run it against a live Calypso**

E2E needs a running Calypso: either `yarn start` locally (see `test/e2e/docs/tests_local.md`) or point `CALYPSO_BASE_URL` at the PR's calypso.live URL once CI builds it. Then:

```bash
cd test/e2e
yarn playwright test specs/plans/plans__gift-checkout-back.spec.ts --reporter=list
```

Outcomes:
- PASS → keep the spec.
- Skipped ("No plan purchase found") or the server rejects gift checkout for the fixture site (error page instead of the Back button) → the fixture can't exercise gift checkout. Try enabling gifting on the site (`wpcom_gifting_subscription` site option via the REST client if a setter exists — check `packages/calypso-e2e/src/rest-api-client.ts` for a site-settings method). If that isn't possible, delete the spec, and state in the PR that E2E coverage was attempted and why it was dropped.
- Locator failure → inspect the top bar; the button is `Step.BackButton` with visible text "Back" rendered as a `<button>`.

**Step 3: Commit (only if the spec runs)**

```bash
git add test/e2e/specs/plans/plans__gift-checkout-back.spec.ts
git commit --no-verify -m "E2E: cover gift checkout Back navigation"
```

---

### Task 5: Manual verification and PR

**Step 1: Manual check on the sandbox**

On a sandboxed site with a plan, load a page that shows the gifting banner (see `~/WordPress/a8c-projects/wpcom-sandbox/wp-content/blog-plugins/gifting-banner.php` for the display conditions; setting the `wpcom_gifting_subscription` option to `1` forces it). Click the banner → checkout → Back, once logged in and once logged out. Both must land on the site, not WP Admin or `/log-in`. Record a short screen capture for the PR.

**Step 2: Drop the design/plan docs from the branch**

The repo doesn't keep design docs in `docs/plans/`. Before opening the PR:

```bash
git rm -q docs/plans/2026-08-27-gift-checkout-back-navigation-design.md docs/plans/2026-08-27-gift-checkout-back-navigation.md
git commit --no-verify -m "Remove planning docs"
```
(Keep local copies in the scratchpad if needed.) Alternatively squash the branch so the docs never appear.

**Step 3: Push and open a draft PR**

Follow `.github/PULL_REQUEST_TEMPLATE.md` and AGENTS.md rules (draft, `DOTOBRD-600`, no names, no wordpress.com links, checklist items). Suggested title: `Checkout: send gift checkout "Back" to the gifted site`.

```bash
git push --no-verify -u origin emdash/fix-onboarding-back-9g4se
gh pr create --draft --title 'Checkout: send gift checkout "Back" to the gifted site' --body-file <body>
```

PR body must explain: root cause (`cancel_to=/home` → landing-page resolver), why the fix is Calypso-only (cart `gift_details` is server-trusted; `cancel_to` rejects external hosts), the precedence chain, the referrer host check, and the E2E outcome. Attach the Linear issue with the Linear MCP `attach-url` tool.
