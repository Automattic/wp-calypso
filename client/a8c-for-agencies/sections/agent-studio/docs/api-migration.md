# Agent Studio — real API migration

Agent Studio ships against `mockAgentStudioService` (a localStorage stand-in
that lives in `data/mock-agent-studio-service.ts`). This doc is the bridge
between that mock and the real wpcom endpoints under
`/wpcom/v2/agency/<agency_id>/a4a/`. It captures what's missing on the server,
what changes on the client, and the order in which they ship.

The `Project` entity from #110716 is intentionally **not removed** — the
client hides it behind a server-provisioned "Default" project, the server-side
types stay intact so we can resurface projects when more agents land. See
"Default project bridge" below.

## What ships today

**Client surface** (`data/agent-studio-service.ts` → `mock-agent-studio-service.ts`):

- `listOutputs()` — overview's deliverable grid, polled every 2s while
  anything is `generating`.
- `createOutput({ agentId, agentName, deliverableType, title, description })`
  — invoked by every brief form.
- `deleteOutput(outputId)` — card's destructive action.
- `suggestOnePagerContent(brief, field)` — heuristic stand-in behind
  one-pager's "Suggest" button.
- Legacy `listProjects` / `getProject` / `createProject` / `deleteProject` /
  `listProjectOutputs` — unreachable from the active UI; left in place per
  the project-resurrection plan.

**wpcom endpoints** (rest-api-plugins/centralized/agency/):

- `GET/POST /a4a/projects`, `GET/DELETE /a4a/projects/<id>`,
  `GET /a4a/projects/<id>/outputs` — full project CRUD + per-project output
  projection.
- `POST /a4a/runs`, `GET/DELETE /a4a/runs/<id>` — recipe dispatch + polling.
  Public recipes: `compose-one-pager`, `amplify-ai`.
- `GET /a4a/collateral/<post_id>` — variants + `html_url` /
  `pdf_download_url` for a finished one-pager.
- `POST /a4a/media` — image upload to `a8cforagenciesportfolio.wordpress.com`.

## Decisions

1. **Default project bridge.** Server auto-provisions a single "Default"
   project per agency on first need. `project_id` becomes optional on
   `POST /a4a/runs`; the dispatcher resolves it from the default. The
   client never sees projects.
2. **Suggest title/blurb.** The heuristic from the mock moves into the real
   `agentStudioService` as a temporary implementation, marked TODO. Replaced
   by a real LLM call when the wpcom endpoint lands (see "Server gaps").
3. **Image upload.** Happens at submit, inside `agentStudioService.createOutput`.
   Files upload serially to `POST /a4a/media`; returned URLs thread into the
   recipe input. One error path; submit gets slower; form stays simple.
4. **Image → recipe slot mapping.** First file → `hero_url`; remaining files
   ignored. `logo_url` / `partner_logo_url` stay empty (the renderer already
   handles missing brand assets). Multi-image UI stays; gap documented.
5. **Polling.** Bulk list against a new `GET /a4a/outputs` (flat across all
   projects). `useAgentStudioOutputs` keeps its 2s tick.
6. **Card preview.** No image thumbnails. The card swaps the thumb strip for
   a single page icon + "X pages" on `ready` outputs. Server projection emits
   `pageCount`; `previewUrls` stays undefined.
7. **Delete.** `DELETE /a4a/runs/<id>` hard-deletes the run AND its linked
   collateral when terminal; existing cancel path keeps for non-terminal. The
   projection filters cancelled runs so a mid-flight cancel disappears too.
8. **Iris status.** Flip `disabled: true` on Iris (`lib/agents.ts`) — same
   "Joining soon" treatment as Remy — until a `compose-social-assets` recipe
   exists. Brief form code stays so we can re-enable in one line.
9. **Retrieval.** Click on a `ready` card opens the PDF in a new tab. The
   projection adds `downloadUrl` to ready outputs, derived from the linked
   collateral's first variant `pdf_download_url`.

## Sequencing

**PR1 — wpcom** (`~/Projects/wpcom`): all server changes ship together. Lands
and deploys before PR2.

**PR2 — wp-calypso** (this repo): client swap from mock to real service.
Lands once PR1 is in production.

## PR1: wpcom server changes

**`wp-content/rest-api-plugins/centralized/agency/agency-a4a-agent-runs.php`**

- Make `project_id` optional on `POST /a4a/runs`. When absent, the handler
  calls `Project_Repository::find_or_create_default( $agency_id )` (new) and
  injects the resulting id into `$raw_input['project_id']` before
  `Dispatcher::enqueue_recipe`.
- `DELETE /a4a/runs/<run_id>`: when the run is terminal
  (`STATUS_COMPLETED` / `STATUS_FAILED` / `STATUS_CANCELLED`), `wp_delete_post`
  the run and any `a4a_mc_collateral` post linked via `_a4a_run_id`. Keep the
  existing transition-to-cancelled path for non-terminal runs.

**`wp-content/lib/a4a-agents/projects/class-a4a-project-repository.php`**

- New `find_or_create_default( int $agency_id ): Project|WP_Error`. Looks for
  an existing project with `META_IS_DEFAULT = '1'`; creates one named
  `"Default"` with that meta if missing. Idempotent; safe to call on every
  run. Doesn't count against `MAX_PROJECTS_PER_AGENCY`.

**`wp-content/lib/a4a-agents/cpts/class-a4a-project-cpt.php`**

- Add `META_IS_DEFAULT` constant.

**New: `wp-content/rest-api-plugins/centralized/agency/agency-a4a-agent-outputs.php`**

- `GET /wpcom/v2/agency/<agency_id>/a4a/outputs` → `{ outputs: AgentStudioOutput[] }`.
- Internally: load all projects for the agency, run
  `Project_Output_Projection::project_outputs` for each, concatenate, sort by
  `updatedAt` desc, return.
- Auth + capability: `AUTH_A4A_USER` + `a4a_run_agents`, same as siblings.

**`wp-content/lib/a4a-agents/projects/class-a4a-project-output-projection.php`**

- Add `downloadUrl` to projected outputs in `ready` state: read the linked
  collateral post (already bulk-fetched), pick its first variant's
  `pdf_download_url`. Null when no collateral is linked yet.
- Add `pageCount`: derive from collateral's `post_content` using the same
  `<!-- PAGE -->` counting `agency-a4a-collateral.php` already does (extract
  to a shared helper). Null when no collateral is linked yet.
- Filter cancelled runs out of `project_outputs`. The runs endpoint still
  returns them on direct `GET /a4a/runs/<id>` for any caller that needs them.

**`wp-content/lib/a4a-agents/recipes/compose-one-pager.yaml`**

- No change. `project_id` continues to be passed through; the runs handler
  populates it from the default project when the client omits it.

## PR2: wp-calypso client changes

**`client/a8c-for-agencies/sections/agent-studio/data/agent-studio-service.ts`**

- Replace the `mockAgentStudioService` re-export with a real
  `wpcomAgentStudioService` that:
  - reads the active agency id via `getActiveAgencyId` (selector already used
    by other A4A hooks — see `sections/benchmarks/hooks/use-fetch-benchmarks-aggregates.ts`),
  - issues requests through `wpcom.req.{get,post,delete}` with
    `apiNamespace: 'wpcom/v2'` and path `/agency/<id>/a4a/...`,
  - implements `listOutputs` / `createOutput` / `deleteOutput` against the
    new endpoints,
  - keeps `suggestOnePagerContent` as the existing heuristic (literally the
    same code, moved verbatim) with a `// TODO: real endpoint` and a link
    to this doc.

**`client/a8c-for-agencies/sections/agent-studio/types.ts`**

- `CreateAgentStudioOutputInput` grows to carry the recipe-relevant input:

  ```ts
  export interface CreateAgentStudioOutputInput {
  	agentId: AgentStudioAgentId;
  	agentName: string;
  	deliverableType: string;
  	// User-typed metadata, surfaced on the card.
  	title: string;
  	description: string;
  	// Recipe input — used only when the agent has a recipe (today: one-pager).
  	brief: string;
  	blurb: string;
  	images: File[];
  }
  ```

- `AgentStudioOutput` gains `downloadUrl?: string` and `pageCount?: number`.

**`client/a8c-for-agencies/sections/agent-studio/data/use-agent-studio-outputs.ts`**

- Query key includes the agency id.
- Calls `GET /agency/<id>/a4a/outputs`; service returns `data.outputs`.
- Keep the existing 2s `refetchInterval` while anything is `generating`.

**`client/a8c-for-agencies/sections/agent-studio/data/use-create-agent-studio-output.ts`**

- No change in shape — still a `useMutation` that delegates to the service.
- Service internally:
  1. Upload `images[0]` via `POST /a4a/media`, capture the returned `url`.
  2. `POST /a4a/runs` with `{ recipe: 'compose-one-pager', input: { text: brief, blurb, hero_url } }`.
  3. Return a synthesized `AgentStudioOutput` from `{ run_id, status }` plus
     the input metadata (title, description, agentName, deliverableType,
     `createdAt: new Date().toISOString()`, `status: 'generating'`).
  4. Caller invalidates `outputs` query; the next tick picks up the real row.

**`client/a8c-for-agencies/sections/agent-studio/data/use-delete-agent-studio-output.ts`**

- No change. Service `deleteOutput` calls `DELETE /a4a/runs/<id>`.

**`client/a8c-for-agencies/sections/agent-studio/primary/brief/one-pager-brief-form.tsx`**

- `mutation.mutate(...)` payload grows to carry `brief` (from `brief` state)
  and `images: File[]` (from `images` state) in addition to today's fields.

**`client/a8c-for-agencies/sections/agent-studio/primary/brief/social-assets-brief-form.tsx`**

- No code changes today; the form becomes unreachable once Iris is disabled.

**`client/a8c-for-agencies/sections/agent-studio/lib/agents.ts`**

- Iris: `disabled: true`. Greeting and copy stay.

**`client/a8c-for-agencies/sections/agent-studio/primary/overview/deliverable-card.tsx`**

- `DeliverablePreview` for `ready`: when `output.previewUrls` is absent
  (current reality), render a single page icon + `output.pageCount` "pages"
  copy. The strip stays for forward-compat when previews land.
- Card wraps in an anchor (or `onClick`) that opens `output.downloadUrl` in a
  new tab when status is `ready` and `downloadUrl` is set. Delete button
  stops propagation.
- `getMetaLabel`: prefer `pageCount` over `assetCount` for the one-pager
  agent, fall back to the existing `assetCount` heuristic. Keeps the social
  branch ready for when Iris ships.

**Mock removal**

- `data/mock-agent-studio-service.ts` and its test stay for one release as a
  development-only fallback (toggled by a build flag, or kept as a reference
  for the project-resurrection PR). Delete in a follow-up once PR2 is stable.

## Deferred gaps

These are real product gaps the migration creates or surfaces, but doesn't
close:

- **Suggest title/blurb endpoint.** Today's heuristic is good enough for the
  shape of the brief. A real `POST /a4a/suggest-content` (or similar) would
  call the LLM with the brief and field requested. Tracking:
  `client/a8c-for-agencies/sections/agent-studio/data/agent-studio-service.ts`
  → look for `TODO: real suggest endpoint`.
- **`compose-social-assets` recipe** for Iris. UI form already exists with
  source/manual modes. Needs an ability pipeline that emits the four social
  sizes (`1200×630`, `1080×1080`, `600×300`, `1080×1920`).
- **`compose-event-assets` recipe** for Remy. Form does not yet exist.
- **Multi-image support in `compose-one-pager`.** Today only `hero_url` is
  wired. The brief form already lets agencies reorder up to N files. A
  recipe-input change (e.g., `images: string[]`) plus a placement strategy
  in `op-layout-director-ela` would close this.
- **Image thumbnails on `DeliverableCard`.** A Browserless screenshot step
  appended to the one-pager recipe (or a separate post-render job) would
  emit a small PNG of the cover, stored on the collateral and surfaced as
  `previewUrls` by the projection.
- **Output detail view.** Click-opens-PDF is the MVP. A real detail route
  (`/agents/:agentId/outputs/:outputId`) with variant picking and HTML
  preview is the next step, modelled on the legacy `project-detail` page.
- **Trash / undo.** Hard delete is destructive. A trashed-runs view with a
  restore action would be a meaningful follow-up; it'd swap the projection
  filter from "drop cancelled" to "drop trashed unless trashed view".

## Open questions

None at handoff time. Decisions 1–9 above were resolved through the
`/grill-with-docs` session attached to the PR review on #110840.
