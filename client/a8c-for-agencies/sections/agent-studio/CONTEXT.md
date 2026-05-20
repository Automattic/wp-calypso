# Agent Studio — domain glossary

Short reference for the surprising vocabulary that crosses the
wpcom (`wp-content/lib/a4a-agents/`) / wp-calypso seam. Keep entries
to terms that aren't obvious from reading the code; don't catalogue
every type.

## Agent

A named persona the agency briefs ("Iris", "June", "Remy"). Each Agent
maps to a recipe slug on the server (today: `June` → `compose-one-pager`).
Agents not yet backed by a recipe ship `disabled: true` in `lib/agents.ts`.

## Brief

The form an agency fills out before dispatch. Distinct from the
`extract_brief` step inside the one-pager recipe, which is an LLM call
that turns the free-form pasted text into a structured `Brief` object
(headline + body sections + stats + CTA). Same word; different things.

## Project

Server-side container for a set of runs. Hidden from the client behind
a single auto-provisioned "Default" project per agency. The legacy
project CRUD lives in `data/use-agent-studio-project*.ts` and
`primary/project-detail/` — unreachable from the active UI, kept so
projects can resurface when more agents land.

## Run

A single execution of a recipe on the server (`a4a_agent_run` post type,
DTO `\A4A\Agents\Run`). The async-jobs worker walks the recipe steps;
the run's status (`a4a_pending` / `a4a_running` / `a4a_completed` /
`a4a_failed` / `a4a_cancelled`) is what the projection maps to the
client's `generating` / `ready` / `failed`.

## Output (server) = Deliverable (client)

What an agency sees on a card on the Agent Studio overview. Server-side
it's a projection over a `Run`, never a distinct entity — see
`Project_Output_Projection`. Client-side the type is `AgentStudioOutput`
but the user-facing label and copy uses "deliverable" everywhere.

## Collateral

The persisted artifact a one-pager run produces (`a4a_mc_collateral`
post). One collateral has many `Variants`. The Calypso card opens the
first variant's PDF; a future detail view will let agencies pick.

## Variant

A single (frame layout × theme) combination of a Collateral. Each
variant has an `html_url` (HTML preview) and `pdf_download_url`. Server
computes URLs deterministically from `(agency_id, post_id, variant_id)`
— no per-variant attachments are stored.

## Recipe

The YAML pipeline a Run executes
(`wp-content/lib/a4a-agents/recipes/*.yaml`). Each step is an ability
that emits output the next step reads. Recipes the REST endpoint will
dispatch are listed in `PUBLIC_RECIPES`
(`agency-a4a-agent-runs.php:51`).

## Ability

A single step inside a recipe. Either deterministic (PHP class doing
work directly) or an LLM call wrapped by `Agent_Ability`. Registered
under the `a4a-agents` ability category (`0-load.php:88`).
