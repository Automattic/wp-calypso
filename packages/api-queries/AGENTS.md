# API Queries

See `README.md` for the package overview and the general guidelines on adding queries and mutations. This file covers one thing those don't: the `meta.statId` every mutation must carry.

## Commands

```bash
# Run tests
yarn test-packages packages/api-queries

# Type check (also emits dist/types)
yarn typecheck-packages

# Lint
yarn eslint packages/api-queries/src/<file>
```

## Adding a mutation: `meta.statId`

Name the ID `<noun>-<verb>`: the thing acted on first, the action last.

```ts
export const sitePluginActivateMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-plugin-activate' },
		mutationFn: ( plugin: string ) => activatePlugin( siteId, plugin ),
	} );
```

Noun first is what makes the stats display group usefully — every `site-plugin-*` mutation sorts together, where a verb-first `activate-site-plugin` would sort beside `activate-account`.

### Lead with the scope

When a mutation is scoped to one kind of thing, that scope is the start of the noun: `site-` for anything acting on a site, `domain-` for a domain, `purch-` for a purchase. Keep it even when the export name or file leaves it implicit — `deploy-create` in `site-deployments.ts` is `site-deploy-create`, `ssl-cert-provision` is `domain-ssl-provision`. It groups the family and tells a human reading the stat what surface failed. Drop the scope prefix only when the ID overflows the length limit and nothing else will give (see below).

### Describe the call, not the factory

The ID is written by hand and is **deliberately not derived from the export name**. Nothing checks the two against each other, and they are expected to disagree:

- The noun leads even when the export name reads the other way round: `installPluginMutation` → `plugin-install`.
- Where the export name is vague, the ID names what the request actually does. `siteDatabaseMutation` calls `restoreDatabasePassword`, so its ID is `site-db-password-restore`, not `site-database`.

Read the `mutationFn` before naming the ID.

### Always end in a verb

Every ID ends in a verb. That is what keeps stat IDs for queries addable later without `site-php-version` colliding with the mutation's.

Some mutations save a thing and have no obvious verb. Invent one rather than leaving the ID verb-less — a settings write is `-update` (`site-settings-update`, `domain-dns-update`), and a boolean write that goes both ways is `-toggle` (`site-apm-toggle`, `site-jp-module-toggle`).

### Fitting the length limit

**An ID can't exceed 28 characters.** `bumpStat` itself stops at 32; the remaining 4 are reserved for the `.<status>` suffix `MutationErrorTracker` appends.

When an ID overflows, in order of preference:

1. **Drop a redundant word.** Usually the fastest fix and the most readable result — `site-jp-mon-settings-create` → `site-jp-mon-create`, `cancel-pending-email-change` → `email-change-cancel`.
2. **Abbreviate a phrase the way its family already does.** Abbreviations are per-family conventions, not a global table: `two-step-auth` → `2fa`, `subscription` → `sub`, `download` → `dl`, `transfer` → `xfer`, `deployment` → `deploy`, `preference` → `pref`. Match the siblings in the same file rather than inventing a new short form.

Keep a family internally consistent — if one ID abbreviates a word, its siblings should too. Don't abbreviate to buy headroom you don't need: spell the verb out (`-update`, not `-upd`) whenever it fits.

### Always run the test

`statId` is typed as optional — requiring it would force it on every `useMutation` call site repo-wide — so a missing one won't fail the type-check. `meta` also carries an index signature (required by TS#15300), so a typo like `statid` type-checks and silently leaves `statId` undefined.

`src/__tests__/mutation-stat-ids.test.ts` is the only thing that catches either, along with a duplicate or over-length ID. It can't check the naming convention itself — noun-first and verb-final are a review concern, not a testable one. Run it after adding or renaming any mutation:

```bash
yarn test-packages packages/api-queries
```
