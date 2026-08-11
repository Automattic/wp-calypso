Read PR #113429 (5 files, branch `add/wait-heartbeat-17966`), full branch diff vs `trunk`, plus the uncommitted bfcache/cap follow-up. Ran the suite: 21/21 pass. `.ai/PLAN.md` and `.ai/REVIEW.md` are **empty**, so intended architecture could only be checked against the PR body + `.ai/IMPLEMENTATION.md`.

---

# BLOCKER

None. Change is coherent, tested, and the working-tree follow-up genuinely fixes the bfcache holes it claims to.

---

# IMPORTANT

### 1. `pageshow` assumes restore ⇒ visible — corrupts `visible_seconds`, the core metric

`client/lib/analytics/wait-heartbeat/index.ts:220-224`

```ts
const onPageShow = ( event: PageTransitionEvent ) => {
    if ( event.persisted ) {
        markVisibility( true );
    }
};
```

`pagehide` persisted correctly assumes hidden (a frozen document never is visible). `pageshow` persisted does **not** imply visible — a document can be restored from bfcache while `visibilityState === 'hidden'` (Safari restoring on app resume, restore into a non-foreground tab).

**Failure:** doc restored hidden → `visibleSince = now` on a hidden page → all subsequent hidden time counts as visible. Worse, the real `visibilitychange`→visible that follows is swallowed by the dedupe guard (`isVisible === ( wait.visibleSince !== null )`), and the next hide banks the entire bogus stretch into `visibleMs`. `visible_seconds` is the field the whole abandonment inference rests on.

**Fix:** read the actual state instead of assuming.
```ts
const onPageShow = ( event: PageTransitionEvent ) => {
    if ( event.persisted ) {
        markVisibility( isDocumentVisible() );
    }
};
```
Add a test: `pageshow` persisted while `visibilityState === 'hidden'` must not open a visible stretch.

### 2. Late cap emits unbounded `waited_seconds`, and silently drops the return marker

`index.ts:192-199`

```ts
if ( isPastCap( wait, now ) ) {
    endWait( 'capped' );
    return;
}
wait.beats += 1;
emit( 'calypso_transfer_wait_heartbeat', ... );
```

Two consequences, both new with this follow-up:

- The `..._ended` event carries `waited_seconds` computed as `now - startedAt` with no clamp. Via the interval path that overshoots by ≤20s; via this path it is **unbounded** — a tab suspended 6 hours emits `reason: 'capped', waited_seconds: 21600`. The PR body states the cap exists precisely so a forgotten tab does not "inflate the tail". Any query that averages/percentiles `waited_seconds` without filtering `reason != 'capped'` now gets the exact inflation the cap was meant to prevent.
- The `return` skips the heartbeat, so **the return itself is never recorded**. Test `'closes a wait that comes back from beyond the cap'` (test/index.tsx:268) codifies this: `heartbeat` length 0. But "person leaves for 20 min and comes back" is exactly the behaviour DOTCOM-17967 ("you can leave, we'll notify you") needs measured. It is now unobservable past 15 min.

**Fix:** emit the visibility beat first, then cap; and mark the late path so it is filterable:
```ts
wait.beats += 1;
emit( 'calypso_transfer_wait_heartbeat', { trigger: 'visibility' as BeatTrigger } );
if ( isPastCap( wait, now ) ) {
    endWait( 'capped' );
}
```
plus an extra property on the ended event (e.g. `capped_after_suspension: true`) so `waited_seconds` on that bucket is excludable. Note it in the hook doc block — right now nothing tells a reader of the data that `capped` has two very different shapes.

### 3. `stepper_processing` cannot tell a completed wait from a failed one

`client/landing/stepper/.../processing-step/index.tsx:121-128`

```ts
enabled: typeof action === 'function' && ! hasActionSuccessfullyRun,
properties: { flow, previous_step: props.data?.previousStep ?? null },
```

On success `hasActionSuccessfullyRun` flips → wait ends `stopped`. On failure (`catch` at index.tsx:154-163) `hasActionSuccessfullyRun` stays false, `submit(FAILURE)` navigates away, wait ends `stopped` on unmount. **Identical event, identical properties.** The other two surfaces carry a discriminator (`outcome` in marketplace, `transfer_status` in transfer-pending); this one carries none, so the third of three surfaces answers "did they stay?" but not "did it work?".

**Fix:** hoist the failure into state (the `catch` already has `e`) and pass it, e.g. `properties: { flow, previous_step, outcome: hasActionSuccessfullyRun ? 'succeeded' : processingError ?? null }`, mirroring `use-product-install.tsx:365`.

### 4. Zero tests at any of the three call sites

The hook has 21 tests. The wiring — which is where the subtle logic actually lives — has none:

- `use-product-install.tsx:346-348`: the `hasSucceededRef` latch, whose stated purpose is surviving the empty-plugin-list gap during redirect. Nothing verifies the latch, nor that `enabled` goes false *before* the redirect (the PR body calls this the difference between a finished install and a closed tab).
- `transfer-pending/index.tsx:37`: `enabled: !! siteId` with `siteId` arriving late.
- `processing-step/index.tsx:121`: `enabled` gating on `action`.

The PR's Testing Instructions ask a reviewer to *run* those existing suites, which pass unchanged — they assert nothing about the new behaviour. A regression that flips `enabled` at the wrong moment (silently turning every successful install into an apparent abandonment) would ship green.

**Fix:** at minimum one test in the marketplace suite: install succeeds → `calypso_transfer_wait_ended` fires with `outcome: 'succeeded'`, exactly once, and the plugin list going momentarily empty afterwards does not open a second wait.

### 5. Event volume — up to 46 Tracks events per wait, on high-traffic surfaces

`HEARTBEAT_MS = 20s`, `HEARTBEAT_CAP_MS = 15min` → up to 45 heartbeats + started/ended per wait, plus one per visibility flip. Checkout thank-you and stepper processing are two of the highest-volume screens in Calypso. Nothing in the PR body or `IMPLEMENTATION.md` shows this was sized with the Tracks owners.

**Fix:** either confirm the volume is acceptable and say so in the PR description, or back off after the first few minutes (20s for the first 2 min — where the resolution actually matters, per the ~40s transfer anatomy — then 60s). Backoff drops the worst case from 45 to ~19 without losing any resolution in the window anyone is looking at.

---

# NIT

1. **`isDocumentVisible` treats `prerender` as visible** — `index.ts:29-30` uses `!== 'hidden'`. A prerendered wait screen banks visible time for nobody. `document.visibilityState === 'visible'` is the intended predicate; keep the `typeof document === 'undefined'` SSR short-circuit.

2. **`isPastCap` takes a structural type, not `Wait`** — `index.ts:32`. `( wait: { startedAt: number }, now: number )` accepts any object with a `startedAt`. Use `( wait: Wait, now: number )`; nothing here needs the width.

3. **`as BeatTrigger` casts are load-bearing on nothing** — `index.ts:199, 247`. The casts only widen a string literal. Type `emit`'s `extra` (`Record<string, unknown> & { trigger?: BeatTrigger; reason?: EndReason }`, or two named emit helpers) and drop both casts. Same for `emit( name: string )` — the three event names are a closed set and could be a union.

4. **Visibility state is implicit in `visibleSince !== null`** — `index.ts:182-191`. The dedupe guard reads `isVisible === ( wait.visibleSince !== null )`, which makes a null-timestamp double as a state flag. It works, but an explicit `isVisible: boolean` on `Wait` would make the guard and finding #1 above self-evident rather than requiring the reader to reconstruct the state machine. Costs one field.

5. **Ref mutated during render** — `index.ts:99-100` and `use-product-install.tsx:346-348`. Both are safe today (idempotent latch; ref read only from effects/handlers) but are the pattern React flags under concurrent rendering. Worth a one-line comment on `propertiesRef` explaining why the effect-based alternative is wrong here — an effect update would break `'closes with the context as it stands at the end'`, and that is genuinely non-obvious.

6. **Comment density** — `index.ts` is roughly a third prose, in a register ("beating for nobody", "the gap reads as censored") well above the surrounding `client/lib` code. The rationale is worth keeping; AGENTS.md asks for matching the surrounding density. Consider moving the design narrative into the hook's doc block (where it already partly lives) and leaving one-liners at the branches.

7. **`markVisibility` naming** — it both marks *and* emits *and* can end the wait. `markVisibility` reads as a pure state write. `handleVisibilityChange` would match what it does.

8. **`.ai/` is untracked in the working tree** — confirm it is gitignored or excluded before the follow-up commit; the PR's file list is clean today.

9. **`pageTransition` helper's `act()` result is unawaited** — `test/index.tsx:37-42`. Fine for sync callbacks and it passes, but the other helper (`advance`) is awaited; the asymmetry invites a future async version to be silently dropped.

10. **Untested paths worth cheap coverage** — non-persisted `pageshow` (normal page load) emits nothing; `enabled` false→true→false produces two distinct `wait_id`s; hook mounting while the document is already hidden starts with `visibleSince === null`.

---

## Against intended architecture / acceptance criteria

- `.ai/PLAN.md` and `.ai/REVIEW.md` are empty, as `IMPLEMENTATION.md` itself flags. There is no plan to check against — the four claims in `IMPLEMENTATION.md` ("persisted pagehide marks hidden", "duplicate signals ignored", "suspended waits capped on return", "coverage added") are all true of the diff and all covered by passing tests.
- `IMPLEMENTATION.md:24` reports `yarn typecheck-client` **blocked by unrelated Dashboard omnibar errors** — i.e. the check AGENTS.md requires before pushing did not complete. Worth confirming those errors are genuinely pre-existing on `trunk` (`git stash && yarn typecheck-client`) so `type_check_client` does not fail on the PR.
- No security or privacy issue found. Payload is `site_id`, `order_id`, flow/product slugs and timing — no PII, no user-controlled data reaching the event names, and the hook-owned fields are spread after caller properties (`index.ts:117-130`) with a test locking that down. The privacy-label question the PR raises for a reviewer is the right call to surface.
