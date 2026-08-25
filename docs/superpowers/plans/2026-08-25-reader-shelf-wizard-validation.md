# Reader Shelf Wizard Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users navigate back to an invalid create-wizard step without weakening submission validation.

**Architecture:** Keep the existing aggregate validation for `handleSave` and edit-mode Save. Add a create-wizard-only validation value derived from the visible step, and use it for the shared Next/Create button.

**Tech Stack:** React, TypeScript, Jest, Testing Library, `userEvent`.

---

### Task 1: Add the create-wizard regression test

**Files:**
- Test: `client/reader/shelves/create-modal/test/index.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that reaches Topics, enters nine tags, confirms Create is disabled, clicks Back, and expects the Feeds-step Next button to be enabled.

```tsx
it( 'can return to an invalid later step after going back', async () => {
	const { user } = setup();
	await reachTopicsStep( user );

	const tags = screen.getByRole( 'combobox', { name: 'Tags' } );
	for ( let index = 1; index <= 9; index++ ) {
		await user.type( tags, `tag-${ index }[Enter]` );
	}

	expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	await user.click( screen.getByRole( 'button', { name: 'Back' } ) );
	expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeEnabled();
} );
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
yarn test-client client/reader/shelves/create-modal/test/index.test.tsx --runInBand
```

Expected: the new test fails because Next is disabled on Feeds by the hidden tag error.

### Task 2: Scope create-wizard navigation validation

**Files:**
- Modify: `client/reader/shelves/customize-modal/index.tsx`

- [ ] **Step 1: Add current-step validation**

After computing `currentStep`, derive the error state for the visible wizard step:

```tsx
const currentStepHasValidationError =
	currentStep.name === 'identity'
		? !! nameError
		: currentStep.name === 'sources'
			? !! feedsError
			: currentStep.name === 'topics'
				? !! ( tagsError || languagesError )
				: false;
```

- [ ] **Step 2: Use it for create navigation**

Replace the create footer button's aggregate condition:

```tsx
disabled={ currentStepHasValidationError || isPending }
```

Leave `handleSave` and edit-mode Save on `hasValidationError`.

- [ ] **Step 3: Run the regression test and verify GREEN**

Run:

```bash
yarn test-client client/reader/shelves/create-modal/test/index.test.tsx --runInBand
```

Expected: the complete file passes, including the new regression test.

### Task 3: Verify the focused change

**Files:**
- Verify: `client/reader/shelves/create-modal/test/index.test.tsx`
- Verify: `client/reader/shelves/customize-modal/index.tsx`

- [ ] **Step 1: Run related modal tests**

```bash
yarn test-client client/reader/shelves/create-modal/test/index.test.tsx client/reader/shelves/customize-modal/test/index.test.tsx client/reader/shelves/customize-modal/test/topics-tab.test.tsx --runInBand
```

Expected: all suites pass.

- [ ] **Step 2: Run lint and whitespace checks**

```bash
yarn eslint client/reader/shelves/create-modal/test/index.test.tsx client/reader/shelves/customize-modal/index.tsx
git diff --check origin/trunk...
```

Expected: both commands exit successfully.

- [ ] **Step 3: Commit the implementation**

```bash
git add client/reader/shelves/create-modal/test/index.test.tsx client/reader/shelves/customize-modal/index.tsx docs/superpowers/plans/2026-08-25-reader-shelf-wizard-validation.md
git commit -m "Reader Shelves: keep wizard validation navigable"
```
