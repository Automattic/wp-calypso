# Domain-Only Checkout Simplification Experiment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the ExPlat experiment `calypso_signup_domain_only_checkout_simplification_v1` assigns a user to "treatment", skip the "Choose how to use your domain" (`new-or-existing-site`) step and send them directly to domain-only checkout.

**Architecture:** Add `useExperiment` to `useStepNavigation` in `domain.ts`. At the two navigation callsites that route to `NEW_OR_EXISTING_SITE`, check `isTreatment` and replace that navigation with a direct `window.location.assign` to `/checkout/no-site` with `isDomainOnly=1`. No other files change.

**Tech Stack:** TypeScript, React hooks, ExPlat (`calypso/lib/explat`), Jest + `@testing-library/react`

---

## File Map

| Action | Path |
|--------|------|
| Modify | `client/landing/stepper/declarative-flow/flows/domain/domain.ts` |
| Create | `client/landing/stepper/declarative-flow/flows/domain/test/domain.test.tsx` |

---

### Task 1: Write failing tests

**Files:**
- Create: `client/landing/stepper/declarative-flow/flows/domain/test/domain.test.tsx`

- [ ] **Step 1.1: Create the test file**

```tsx
/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { DOMAIN_FLOW } from '@automattic/onboarding';
import { STEPS } from '../../internals/steps';
import { getFlowLocation, renderFlow } from '../../../test/helpers';
import domainFlow from '../domain';

const originalLocation = window.location;

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: ( path: string ) => path,
} ) );

jest.mock( 'calypso/dashboard/utils/site-features', () => ( {
	hasPlanFeature: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	default: { req: { post: jest.fn() } },
} ) );

jest.mock( 'calypso/lib/analytics/signup', () => ( {
	SIGNUP_DOMAIN_ORIGIN: { USE_YOUR_DOMAIN: 'use-your-domain', FREE: 'free' },
} ) );

jest.mock( 'calypso/signup/steps/site-picker/site-picker-submit', () => ( {
	siteHasPaidPlan: jest.fn(),
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	persistSignupDestination: jest.fn(),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	DOMAIN_FLOW: 'domain',
	addProductsToCart: jest.fn(),
	clearStepPersistedState: jest.fn(),
	replaceProductsInCart: jest.fn(),
} ) );

jest.mock( '../../../utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown[] ) => steps,
} ) );

jest.mock( '../../../stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/selectors/get-selected-site', () => jest.fn() );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: jest.fn( () => jest.fn() ),
} ) );

jest.mock( '../../../hooks/use-site-data', () => ( {
	useSiteData: jest.fn(),
} ) );

jest.mock( '../../../hooks/use-query', () => ( {
	useQuery: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( () => ( {
		setDomainCartItem: jest.fn(),
		setDomainCartItems: jest.fn(),
		setSiteUrl: jest.fn(),
		setSignupDomainOrigin: jest.fn(),
		setPlanCartItem: jest.fn(),
		setProductCartItems: jest.fn(),
		setPendingAction: jest.fn(),
		setHideFreePlan: jest.fn(),
		resetOnboardStore: jest.fn(),
	} ) ),
	useSelect: jest.fn( () => ( {
		signupDomainOrigin: '',
		domainCartItems: [],
	} ) ),
	dispatch: jest.fn(),
	select: jest.fn(),
	registerStore: jest.fn(),
	createReduxStore: jest.fn(),
	combineReducers: jest.fn(),
	createRegistry: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	register: jest.fn(),
	resolveSelect: jest.fn(),
} ) );

import { useExperiment } from 'calypso/lib/explat';
import { useSiteData } from '../../../hooks/use-site-data';
import { useQuery } from '../../../hooks/use-query';

const mockUseQuery = ( overrides: Record< string, string | null > = {} ) => {
	( useQuery as jest.Mock ).mockReturnValue( {
		get: ( key: string ) => overrides[ key ] ?? null,
	} );
};

const mockUseSiteData = ( overrides = {} ) => {
	( useSiteData as jest.Mock ).mockReturnValue( {
		site: null,
		siteSlug: '',
		siteId: null,
		...overrides,
	} );
};

describe( 'Domain Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				replace: jest.fn(),
				href: 'http://wordpress.com/setup/domain/domain-search',
				search: '',
			},
			writable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseQuery();
		mockUseSiteData();
		// Default: control group (not treatment)
		( useExperiment as jest.Mock ).mockReturnValue( [ false, { variationName: 'control' } ] );
	} );

	describe( 'Flow configuration', () => {
		it( 'should have the correct flow name', () => {
			expect( domainFlow.name ).toBe( DOMAIN_FLOW );
		} );
	} );

	describe( 'DOMAIN_SEARCH step — treatment variant', () => {
		it( 'should go directly to domain-only checkout when treatment and no existing site', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				false,
				{ variationName: 'treatment' },
			] );

			const { runUseStepNavigationSubmit } = renderFlow( domainFlow );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				currentURL: '/setup/domain/domain-search',
				dependencies: {
					domainItem: { product_slug: 'dotcom_domain', meta: 'test.com' },
					domainCart: [ { product_slug: 'dotcom_domain', meta: 'test.com' } ],
					siteUrl: '',
					signupDomainOrigin: 'search',
					navigateToUseMyDomain: false,
					lastQuery: '',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/no-site' )
			);
			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( 'isDomainOnly=1' )
			);
		} );

		it( 'should navigate to new-or-existing-site when control and no existing site', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				false,
				{ variationName: 'control' },
			] );

			const { runUseStepNavigationSubmit } = renderFlow( domainFlow );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				currentURL: '/setup/domain/domain-search',
				dependencies: {
					domainItem: { product_slug: 'dotcom_domain', meta: 'test.com' },
					domainCart: [ { product_slug: 'dotcom_domain', meta: 'test.com' } ],
					siteUrl: '',
					signupDomainOrigin: 'search',
					navigateToUseMyDomain: false,
					lastQuery: '',
				},
			} );

			expect( window.location.assign ).not.toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/no-site' )
			);
			const destination = getFlowLocation();
			expect( destination.step ).toBe( STEPS.NEW_OR_EXISTING_SITE.slug );
		} );

		it( 'should not bypass new-or-existing-site when experiment is still loading', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				true, // isLoadingExperiment = true
				null,
			] );

			const { runUseStepNavigationSubmit } = renderFlow( domainFlow );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				currentURL: '/setup/domain/domain-search',
				dependencies: {
					domainItem: { product_slug: 'dotcom_domain', meta: 'test.com' },
					domainCart: [ { product_slug: 'dotcom_domain', meta: 'test.com' } ],
					siteUrl: '',
					signupDomainOrigin: 'search',
					navigateToUseMyDomain: false,
					lastQuery: '',
				},
			} );

			expect( window.location.assign ).not.toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/no-site' )
			);
			const destination = getFlowLocation();
			expect( destination.step ).toBe( STEPS.NEW_OR_EXISTING_SITE.slug );
		} );
	} );

	describe( 'USE_MY_DOMAIN step — treatment variant', () => {
		it( 'should go directly to domain-only checkout when treatment and no existing site', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				false,
				{ variationName: 'treatment' },
			] );

			const { runUseStepNavigationSubmit } = renderFlow( domainFlow );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				currentURL: '/setup/domain/use-my-domain',
				dependencies: {
					domainCartItem: { product_slug: 'dotcom_domain', meta: 'test.com' },
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/no-site' )
			);
			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( 'isDomainOnly=1' )
			);
		} );

		it( 'should navigate to new-or-existing-site when control and no existing site', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				false,
				{ variationName: 'control' },
			] );

			const { runUseStepNavigationSubmit } = renderFlow( domainFlow );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				currentURL: '/setup/domain/use-my-domain',
				dependencies: {
					domainCartItem: { product_slug: 'dotcom_domain', meta: 'test.com' },
				},
			} );

			expect( window.location.assign ).not.toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/no-site' )
			);
			const destination = getFlowLocation();
			expect( destination.step ).toBe( STEPS.NEW_OR_EXISTING_SITE.slug );
		} );
	} );
} );
```

- [ ] **Step 1.2: Run the tests to confirm they fail**

```bash
yarn test-client client/landing/stepper/declarative-flow/flows/domain/test/domain.test.tsx
```

Expected: Tests fail because `useExperiment` is not yet imported or used in `domain.ts`. You should see errors like "Expected: stringContaining '/checkout/no-site'" or navigation going to the wrong place.

- [ ] **Step 1.3: Commit the failing tests**

```bash
git add client/landing/stepper/declarative-flow/flows/domain/test/domain.test.tsx
git commit -m "test(domain-flow): add failing tests for checkout simplification experiment"
```

---

### Task 2: Implement the experiment in domain.ts

**Files:**
- Modify: `client/landing/stepper/declarative-flow/flows/domain/domain.ts`

- [ ] **Step 2.1: Add the useExperiment import**

In `domain.ts`, add to the existing import block (after the `react` import, before the `calypso/dashboard` imports):

```ts
import { useExperiment } from 'calypso/lib/explat';
```

- [ ] **Step 2.2: Add the experiment hook inside useStepNavigation**

In `useStepNavigation`, after the existing `const isCiab = ...` line (around line 99), add:

```ts
const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
    'calypso_signup_domain_only_checkout_simplification_v1'
);
const isTreatment = ! isLoadingExperiment && experimentAssignment?.variationName === 'treatment';
```

- [ ] **Step 2.3: Update the DOMAIN_SEARCH callsite**

Find the block inside the `DOMAIN_SEARCH` case (around line 184):

```ts
if ( ! site ) {
    return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );
}
```

Replace it with:

```ts
if ( ! site ) {
    if ( isTreatment ) {
        return window.location.assign(
            addQueryArgs( '/checkout/no-site', {
                redirect_to: dashboardLink( '/domains' ),
                signup: 0,
                isDomainOnly: 1,
                cancel_to: new URL(
                    addQueryArgs( '/setup/domain', window.location.search ),
                    window.location.href
                ).href,
            } )
        );
    }
    return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );
}
```

- [ ] **Step 2.4: Update the USE_MY_DOMAIN callsite**

Find the block at the end of the `USE_MY_DOMAIN` case (around line 315–320):

```ts
setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
setHideFreePlan( true );
setDomainCartItem( providedDependencies.domainCartItem );
setDomainCartItems( [ providedDependencies.domainCartItem ] );

return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );
```

Replace it with:

```ts
setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
setHideFreePlan( true );
setDomainCartItem( providedDependencies.domainCartItem );
setDomainCartItems( [ providedDependencies.domainCartItem ] );

if ( isTreatment ) {
    return window.location.assign(
        addQueryArgs( '/checkout/no-site', {
            redirect_to: dashboardLink( '/domains' ),
            signup: 0,
            isDomainOnly: 1,
            cancel_to: new URL(
                addQueryArgs( '/setup/domain', window.location.search ),
                window.location.href
            ).href,
        } )
    );
}
return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );
```

- [ ] **Step 2.5: Run the tests to confirm they pass**

```bash
yarn test-client client/landing/stepper/declarative-flow/flows/domain/test/domain.test.tsx
```

Expected: All tests pass. You should see `PASS` with all test suites green.

- [ ] **Step 2.6: Run the linter**

```bash
yarn eslint --fix client/landing/stepper/declarative-flow/flows/domain/domain.ts
```

Expected: No errors.

- [ ] **Step 2.7: Commit the implementation**

```bash
git add client/landing/stepper/declarative-flow/flows/domain/domain.ts
git commit -m "feat(domain-flow): skip new-or-existing-site step for experiment treatment variant

Experiment: calypso_signup_domain_only_checkout_simplification_v1
Treatment group bypasses the pre-checkout 'Choose how to use your domain'
step and goes directly to domain-only checkout (/checkout/no-site with
isDomainOnly=1). Control group behavior is unchanged."
```
