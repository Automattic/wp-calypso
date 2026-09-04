# Survicate Modal-Aware Suppression Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close (or never trigger) Survicate surveys while any modal dialog is open on screen, generalizing the existing Help-Center-only rule.

**Architecture:** A new `modal-detection` module in `packages/survicate` provides `isModalOpen()` (DOM query for open modals, excluding Survicate's own widget) and `observeModals()` (MutationObserver that fires when a modal is inserted). The existing Help Center guards in `invoke-event.ts` and `load-script.ts` widen to `shouldSuppressSurvey() = isHelpCenterOpen() || isModalOpen()`. A mirrored inline-JS change goes to `class-survicate.php` in the Jetpack monorepo (separate repo/PR, code included in Task 7).

**Tech Stack:** TypeScript, Jest + jsdom (existing `packages/survicate` test setup), tab indentation.

**Design doc:** `docs/plans/2026-08-28-survicate-modal-suppression-design.md`

## Verified facts (do not re-derive)

- The Survicate widget core (`widget_core-28.33.0.js`) creates
  `<div id="survicate-box" class="survicate-box-<type>">` appended to
  `document.body`, and renders `role="dialog"` / `aria-modal="true"` elements
  **inside it**. Without self-exclusion the rule closes every survey instantly.
  Exclusion selector: `el.closest( '#survicate-box, [class*="survicate-box"]' )`.
- jsdom implements no layout: `getClientRects()` returns `[]` for everything.
  The rendered-check therefore prefers `Element.checkVisibility()` when the
  browser provides it and falls back to `getClientRects()`. Tests stub
  `checkVisibility` per element.
- The existing `survey_displayed` listener and `SurvicateReady` listener in
  `load-script.ts` are page-lifetime (no cleanup). The new observer follows the
  same lifetime; `observeModals` still returns a disconnect function for
  testability and future callers.

## Environment notes (emdash worktree)

- Check `ls node_modules/.bin/jest` first. If missing, run checks from the main
  checkout `~/WordPress/a8c-projects/wp-calypso` or rely on CI; a full
  `yarn install` is ~1.9GB.
- Prepend Node 24 in every command:
  `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"`.
- Commit with `--no-verify` (husky is not initialized in worktrees).
- Test command: `yarn test-packages packages/survicate`.
  Typecheck: `cd packages/survicate && npx tsc --build ./tsconfig.json`.
  Lint: `yarn eslint packages/survicate/src/<file>`.

---

### Task 1: `isModalOpen()` — detection primitive

**Files:**
- Create: `packages/survicate/src/modal-detection.ts`
- Test: `packages/survicate/src/test/modal-detection.test.ts`

**Step 1: Write the failing tests**

```ts
/**
 * @jest-environment jsdom
 */

import { isModalOpen } from '../modal-detection';

function makeRendered< T extends HTMLElement >( el: T ): T {
	( el as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
	return el;
}

describe( 'isModalOpen', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'should return false when the document has no modals', () => {
		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should detect an aria-modal dialog', () => {
		const modal = makeRendered( document.createElement( 'div' ) );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should detect an open native dialog', () => {
		const dialog = makeRendered( document.createElement( 'dialog' ) );
		dialog.setAttribute( 'open', '' );
		document.body.appendChild( dialog );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should detect a WordPress modal screen overlay', () => {
		const overlay = makeRendered( document.createElement( 'div' ) );
		overlay.className = 'components-modal__screen-overlay';
		document.body.appendChild( overlay );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should ignore a dialog role without aria-modal', () => {
		const popover = makeRendered( document.createElement( 'div' ) );
		popover.setAttribute( 'role', 'dialog' );
		document.body.appendChild( popover );

		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should ignore dialogs inside the Survicate widget', () => {
		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		box.className = 'survicate-box-survey';
		const survey = makeRendered( document.createElement( 'div' ) );
		survey.setAttribute( 'role', 'dialog' );
		survey.setAttribute( 'aria-modal', 'true' );
		box.appendChild( survey );
		document.body.appendChild( box );

		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should ignore a modal that is not rendered', () => {
		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => false;
		document.body.appendChild( modal );

		expect( isModalOpen() ).toBe( false );
	} );
} );
```

**Step 2: Run the tests to verify they fail**

Run: `yarn test-packages packages/survicate --testPathPattern=modal-detection`
Expected: FAIL — `Cannot find module '../modal-detection'`.

**Step 3: Write the implementation**

```ts
import debug from './debug';

/**
 * Selects open modal dialogs: a11y-correct modals (`aria-modal` excludes
 * popovers/tooltips that only set `role="dialog"`), native `<dialog open>`,
 * and older `@wordpress/components` Modal versions whose `aria-modal` sat on
 * an inner node.
 */
export const MODAL_SELECTOR =
	'[role="dialog"][aria-modal="true"], dialog[open], .components-modal__screen-overlay';

/**
 * The Survicate widget renders `role="dialog"`/`aria-modal` elements inside
 * `<div id="survicate-box" class="survicate-box-<type>">`; without this
 * exclusion every survey would suppress itself on display.
 */
const SURVICATE_CONTAINER_SELECTOR = '#survicate-box, [class*="survicate-box"]';

function isElementRendered( element: Element ): boolean {
	const el = element as Element & { checkVisibility?: () => boolean };
	if ( typeof el.checkVisibility === 'function' ) {
		return el.checkVisibility();
	}
	return element.getClientRects().length > 0;
}

/**
 * Checks whether any modal dialog (other than Survicate's own widget) is
 * currently open and rendered. Fails open: any error means "no modal".
 */
export function isModalOpen(): boolean {
	if ( typeof document === 'undefined' ) {
		return false;
	}

	try {
		const candidates = document.querySelectorAll( MODAL_SELECTOR );
		for ( const candidate of candidates ) {
			if ( candidate.closest( SURVICATE_CONTAINER_SELECTOR ) ) {
				continue;
			}
			if ( ! isElementRendered( candidate ) ) {
				continue;
			}
			debug( 'Modal detected: %o', candidate );
			return true;
		}
	} catch {
		return false;
	}

	return false;
}
```

**Step 4: Run the tests to verify they pass**

Run: `yarn test-packages packages/survicate --testPathPattern=modal-detection`
Expected: 7 passing.

**Step 5: Commit**

```bash
git add packages/survicate/src/modal-detection.ts packages/survicate/src/test/modal-detection.test.ts
git commit --no-verify -m "Survicate: add isModalOpen() detection primitive"
```

---

### Task 2: `observeModals()` — modal-insertion observer

**Files:**
- Modify: `packages/survicate/src/modal-detection.ts`
- Test: `packages/survicate/src/test/modal-detection.test.ts`

**Step 1: Add failing tests**

Append to the same test file (jsdom implements MutationObserver; flush with
`await Promise.resolve()` twice or use the callback-capture pattern below —
prefer real timers with an awaited microtask):

```ts
describe( 'observeModals', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	function flushMutations() {
		return new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	}

	test( 'should fire when a modal is inserted', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await flushMutations();

		expect( onOpen ).toHaveBeenCalledTimes( 1 );
		disconnect();
	} );

	test( 'should fire when an inserted subtree contains a modal', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		const wrapper = document.createElement( 'div' );
		const modal = document.createElement( 'dialog' );
		modal.setAttribute( 'open', '' );
		wrapper.appendChild( modal );
		document.body.appendChild( wrapper );
		await flushMutations();

		expect( onOpen ).toHaveBeenCalledTimes( 1 );
		disconnect();
	} );

	test( 'should not fire for non-modal insertions', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		document.body.appendChild( document.createElement( 'div' ) );
		await flushMutations();

		expect( onOpen ).not.toHaveBeenCalled();
		disconnect();
	} );

	test( 'should not fire for the Survicate widget itself', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		const survey = document.createElement( 'div' );
		survey.setAttribute( 'role', 'dialog' );
		survey.setAttribute( 'aria-modal', 'true' );
		box.appendChild( survey );
		document.body.appendChild( box );
		await flushMutations();

		expect( onOpen ).not.toHaveBeenCalled();
		disconnect();
	} );

	test( 'should stop firing after disconnect', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );
		disconnect();

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await flushMutations();

		expect( onOpen ).not.toHaveBeenCalled();
	} );
} );
```

Update the import: `import { isModalOpen, observeModals } from '../modal-detection';`

Note the observer tests do **not** stub `checkVisibility` — insertion detection
deliberately skips the rendered-check (a modal is typically inserted before
styles settle; a false-positive close here is harmless because `closeSurvey()`
is a no-op without a visible survey).

**Step 2: Run to verify the new tests fail**

Run: `yarn test-packages packages/survicate --testPathPattern=modal-detection`
Expected: FAIL — `observeModals` is not exported.

**Step 3: Implement**

Append to `modal-detection.ts`:

```ts
function nodeContainsModal( node: Node ): boolean {
	if ( ! ( node instanceof Element ) ) {
		return false;
	}
	if ( node.closest( SURVICATE_CONTAINER_SELECTOR ) ) {
		return false;
	}

	const candidates = node.matches( MODAL_SELECTOR )
		? [ node ]
		: Array.from( node.querySelectorAll( MODAL_SELECTOR ) );

	return candidates.some( ( el ) => ! el.closest( SURVICATE_CONTAINER_SELECTOR ) );
}

/**
 * Watches for modal dialogs being inserted into the document and invokes
 * `onOpen` for each batch that contains one. Only added nodes are inspected,
 * so the observer is cheap on ordinary DOM churn. Attribute changes are not
 * observed (a native `<dialog>` toggled via `open` in place is the one miss;
 * the `survey_displayed` check still covers it on the next display).
 * @returns A cleanup function that disconnects the observer.
 */
export function observeModals( onOpen: () => void ): () => void {
	if ( typeof document === 'undefined' || typeof MutationObserver === 'undefined' ) {
		return () => {};
	}

	const observer = new MutationObserver( ( mutations ) => {
		for ( const mutation of mutations ) {
			for ( const node of mutation.addedNodes ) {
				if ( nodeContainsModal( node ) ) {
					debug( 'Modal inserted while observing' );
					onOpen();
					return;
				}
			}
		}
	} );

	observer.observe( document.body, { childList: true, subtree: true } );

	return () => observer.disconnect();
}
```

Nuance: `nodeContainsModal` checks the *inserted subtree root* against the
Survicate exclusion, so a `survicate-box` insertion (survey appearing) never
fires `onOpen`.

**Step 4: Run the tests to verify they pass**

Run: `yarn test-packages packages/survicate --testPathPattern=modal-detection`
Expected: 12 passing.

**Step 5: Commit**

```bash
git add packages/survicate/src/modal-detection.ts packages/survicate/src/test/modal-detection.test.ts
git commit --no-verify -m "Survicate: add observeModals() insertion observer"
```

---

### Task 3: `shouldSuppressSurvey()` and the invoke-event guard

**Files:**
- Modify: `packages/survicate/src/invoke-event.ts`
- Test: `packages/survicate/src/test/invoke-event.test.ts`

**Step 1: Add failing tests**

The existing suite mocks `@wordpress/data` and has `setHelpCenterOpen()`. Add a
modal-open branch (reuse the `makeRendered` helper inline):

```ts
test( 'should suppress the event and close the survey when a modal is open', () => {
	const invokeEvent = jest.fn();
	const closeSurvey = jest.fn();
	window._sva = { invokeEvent, closeSurvey };

	const modal = document.createElement( 'div' );
	modal.setAttribute( 'role', 'dialog' );
	modal.setAttribute( 'aria-modal', 'true' );
	( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
	document.body.appendChild( modal );

	invokeSurvicateEvent( 'testEvent' );

	expect( invokeEvent ).not.toHaveBeenCalled();
	expect( closeSurvey ).toHaveBeenCalledTimes( 1 );

	modal.remove();
} );

test( 'should suppress a deferred event when a modal is open at SurvicateReady time', () => {
	const invokeEvent = jest.fn();

	invokeSurvicateEvent( 'testEvent' );

	const modal = document.createElement( 'div' );
	modal.setAttribute( 'role', 'dialog' );
	modal.setAttribute( 'aria-modal', 'true' );
	( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
	document.body.appendChild( modal );

	window._sva = { invokeEvent };
	window.dispatchEvent( new Event( 'SurvicateReady' ) );

	expect( invokeEvent ).not.toHaveBeenCalled();

	modal.remove();
} );
```

**Step 2: Run to verify they fail**

Run: `yarn test-packages packages/survicate --testPathPattern=invoke-event`
Expected: the two new tests FAIL (event fires despite the modal).

**Step 3: Implement**

In `invoke-event.ts`:

```ts
import { isModalOpen } from './modal-detection';
```

Add below `isHelpCenterOpen`:

```ts
/**
 * Whether surveys should currently be suppressed: the Help Center is open
 * (store-based check — more reliable than DOM for a non-`aria-modal` panel)
 * or some other modal dialog is on screen.
 */
export function shouldSuppressSurvey(): boolean {
	return isHelpCenterOpen() || isModalOpen();
}
```

Replace both guard sites in `invokeSurvicateEvent`:
- `if ( isHelpCenterOpen() ) {` → `if ( shouldSuppressSurvey() ) {` and update
  the two debug messages from `(Help Center is open)` to `(Help Center or a
  modal is open)`.

**Step 4: Run the full package suite**

Run: `yarn test-packages packages/survicate`
Expected: all passing (existing Help Center tests unchanged).

**Step 5: Commit**

```bash
git add packages/survicate/src/invoke-event.ts packages/survicate/src/test/invoke-event.test.ts
git commit --no-verify -m "Survicate: suppress invoked events while a modal is open"
```

---

### Task 4: Widen the `survey_displayed` guard and start the observer

**Files:**
- Modify: `packages/survicate/src/load-script.ts`
- Test: `packages/survicate/src/test/load-script.test.ts`

**Step 1: Add failing tests**

```ts
test( 'should close the survey when it is displayed while a modal is open', () => {
	const closeSurvey = jest.fn();
	const addEventListener = jest.fn();
	window._sva = { closeSurvey, addEventListener };

	loadSurvicateScript( 'test-workspace-id' );
	window.dispatchEvent( new Event( 'SurvicateReady' ) );

	const modal = document.createElement( 'div' );
	modal.setAttribute( 'role', 'dialog' );
	modal.setAttribute( 'aria-modal', 'true' );
	( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
	document.body.appendChild( modal );

	const onSurveyDisplayed = addEventListener.mock.calls[ 0 ][ 1 ];
	onSurveyDisplayed();

	expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	modal.remove();
} );

test( 'should close a visible survey when a modal opens', async () => {
	const closeSurvey = jest.fn();
	window._sva = { closeSurvey, addEventListener: jest.fn() };

	loadSurvicateScript( 'test-workspace-id' );
	window.dispatchEvent( new Event( 'SurvicateReady' ) );

	const modal = document.createElement( 'div' );
	modal.setAttribute( 'role', 'dialog' );
	modal.setAttribute( 'aria-modal', 'true' );
	document.body.appendChild( modal );
	await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

	expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	modal.remove();
} );
```

Caveat for the second test: the `SurvicateReady` listener in `load-script.ts`
uses `{ once: true }` **per `loadSurvicateScript` call**, and the module is
re-imported fresh per test file, not per test — earlier tests in this file
already dispatched `SurvicateReady`, and each test calls `loadSurvicateScript`
again, so a new listener is registered each time. This already works for the
existing tests; keep the same pattern. If the observer fires more than once
across tests, add `document.body.innerHTML = ''` to the existing `afterEach`.

**Step 2: Run to verify they fail**

Run: `yarn test-packages packages/survicate --testPathPattern=load-script`
Expected: the two new tests FAIL.

**Step 3: Implement**

In `load-script.ts`, replace the imports and the `SurvicateReady` handler:

```ts
import { isHelpCenterOpen, shouldSuppressSurvey } from './invoke-event';
import { observeModals } from './modal-detection';
```

(keep `isHelpCenterOpen` only if still referenced; otherwise drop it)

```ts
window.addEventListener(
	'SurvicateReady',
	function () {
		window._sva?.addEventListener?.( 'survey_displayed', () => {
			debug( 'Survicate survey displayed' );

			if ( shouldSuppressSurvey() ) {
				debug( 'Survicate survey suppressed (Help Center or a modal is open)' );
				closeSurvicateSurvey();
			}
		} );

		// Close a survey that is already on screen when a modal opens on top
		// of it. Page-lifetime, like the survey_displayed listener above;
		// closeSurvicateSurvey() is a no-op when no survey is visible.
		observeModals( closeSurvicateSurvey );
	},
	{ once: true }
);
```

**Step 4: Run the full package suite, typecheck, lint**

```bash
yarn test-packages packages/survicate
cd packages/survicate && npx tsc --build ./tsconfig.json && cd ../..
yarn eslint packages/survicate/src/modal-detection.ts packages/survicate/src/load-script.ts packages/survicate/src/invoke-event.ts
```
Expected: all green.

**Step 5: Commit**

```bash
git add packages/survicate/src/load-script.ts packages/survicate/src/test/load-script.test.ts
git commit --no-verify -m "Survicate: close surveys when a modal is open or opens"
```

---

### Task 5: Public exports and docs

**Files:**
- Modify: `packages/survicate/src/index.ts`
- Modify: `packages/survicate/AGENTS.md`

**Step 1: Export the new API**

In `index.ts`, add alongside the existing exports:

```ts
export { isModalOpen, observeModals, MODAL_SELECTOR } from './modal-detection';
export { shouldSuppressSurvey } from './invoke-event';
```

(match the file's existing export style — check it first.)

**Step 2: Update AGENTS.md**

Rename the "Help Center coordination (defense-in-depth)" section's framing to
cover modals: document `isModalOpen()` (selector rationale, the verified
`#survicate-box` self-exclusion, the `checkVisibility` rendered-check and its
jsdom stubbing pattern), `observeModals()` (added-nodes-only, no attribute
observation, page lifetime), `shouldSuppressSurvey()`, and note that the
Help Center store check is retained deliberately. Update the file map.

**Step 3: Run the suite one more time**

Run: `yarn test-packages packages/survicate`
Expected: all passing.

**Step 4: Commit**

```bash
git add packages/survicate/src/index.ts packages/survicate/AGENTS.md
git commit --no-verify -m "Survicate: export modal detection API and document it"
```

---

### Task 6: Pre-PR verification (this repo)

**Step 1:** `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"` and run
`NODE_OPTIONS=--max-old-space-size=8192 yarn typecheck-client` from the repo
root **if** `node_modules` exists; otherwise note in the PR that CI covers it
(known emdash-worktree limitation).

**Step 2:** Draft PR per `.github/PULL_REQUEST_TEMPLATE.md` (draft, checklist,
no names/wpcom links). Testing instructions: enable `survicate_enabled`, open a
Calypso page with a WP Modal while a survey campaign targets it, confirm the
survey closes; confirm surveys still show with no modal open.

---

### Task 7: wp-admin mirror (Jetpack monorepo — separate repo and PR)

**Files (in the Jetpack monorepo, not this worktree):**
- Modify: `projects/packages/jetpack-mu-wpcom/src/features/survicate/class-survicate.php`
- Add changelog entry via `jetpack changelog add packages/jetpack-mu-wpcom`.

**Step 1: Extend the inline JS** emitted by `enqueue_scripts()`. Insert after
the `closeAnySurvey` function definition:

```js
	var MODAL_SELECTOR = '[role="dialog"][aria-modal="true"], dialog[open], .components-modal__screen-overlay';
	var SURVICATE_CONTAINER_SELECTOR = '#survicate-box, [class*="survicate-box"]';
	function isElementRendered( el ) {
		if ( typeof el.checkVisibility === 'function' ) {
			return el.checkVisibility();
		}
		return el.getClientRects().length > 0;
	}
	function isModalOpen() {
		try {
			var candidates = document.querySelectorAll( MODAL_SELECTOR );
			for ( var i = 0; i < candidates.length; i++ ) {
				if ( candidates[ i ].closest( SURVICATE_CONTAINER_SELECTOR ) ) {
					continue;
				}
				if ( ! isElementRendered( candidates[ i ] ) ) {
					continue;
				}
				return true;
			}
		} catch ( e ) {
			return false;
		}
		return false;
	}
	function nodeContainsModal( node ) {
		if ( ! node || node.nodeType !== 1 ) {
			return false;
		}
		if ( node.closest( SURVICATE_CONTAINER_SELECTOR ) ) {
			return false;
		}
		if ( node.matches( MODAL_SELECTOR ) ) {
			return true;
		}
		var inner = node.querySelectorAll( MODAL_SELECTOR );
		for ( var i = 0; i < inner.length; i++ ) {
			if ( ! inner[ i ].closest( SURVICATE_CONTAINER_SELECTOR ) ) {
				return true;
			}
		}
		return false;
	}
```

**Step 2: Widen the `survey_displayed` condition** inside the existing
`SurvicateReady` listener: `if ( isHelpCenterShown() ) {` →
`if ( isHelpCenterShown() || isModalOpen() ) {` — in **both** places (the
initial race check and the `survey_displayed` handler).

**Step 3: Add the observer** inside the `SurvicateReady` listener, after the
`survey_displayed` registration:

```js
		if ( typeof MutationObserver === 'function' && document.body ) {
			// Close a survey already on screen when a modal opens on top of it.
			new MutationObserver( function ( mutations ) {
				for ( var m = 0; m < mutations.length; m++ ) {
					var added = mutations[ m ].addedNodes;
					for ( var n = 0; n < added.length; n++ ) {
						if ( nodeContainsModal( added[ n ] ) ) {
							closeAnySurvey();
							return;
						}
					}
				}
			} ).observe( document.body, { childList: true, subtree: true } );
		}
```

**Step 4: Verify manually** on a sandboxed Simple site's wp-admin Site Setup
page (the original repro: goals modal + auto-campaign survey): survey no longer
stays open over the modal. Also confirm a survey still displays on a plain
wp-admin screen with no modal.

**Step 5:** Changelog entry, draft PR in the Jetpack monorepo referencing the
Calypso PR.
