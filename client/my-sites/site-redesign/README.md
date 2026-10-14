# Existing-content site redesign

The `themes/site-redesign` flag defaults off. Eligible selected Free WordPress.com
Simple and Atomic sites get the first Design Your Own Card in the modern grid
and classic theme list, outside search/My Themes. The read-only
`GET wpcom/v2/sites/{id}/site-redesign/eligibility` also must allow preview.

`/site-redesign/:site_id` uses a full-viewport workspace, with the existing native
WordPress Agent on the right. Standard WordPress topbar and left admin navigation
remain available; only the extra workspace inset is removed. The host mounts before its one AgentsManagerLoader;
portal/config cleanup restores ordinary presentation on SPA exit. Readiness
requires the native embedded chat DOM and registered manager actions. The card entry carries a consumed-once `start-designing` marker; after the native
agent connects, it submits the existing Start designing prompt once. Direct
entries and checkout returns do not submit it. The provider's native suggestions are theme independent:
no Gutenberg theme store is required. Other providers retain their theme gate.

The registered wp-orchestrator receives `client.environment=site-redesign` and
`site_redesign={redesign_id,site_id,status}`. The server owns the interview and
allowlists `wpcom/site-redesign-get-site-summary`,
`wpcom/site-redesign-save-brief`, `wpcom/site-redesign-start-generation`, and
`wpcom/site-redesign-start-new-brief` for Free sites. Paid checkout returns expose
only summary/save and finish the existing design. There are no client interview tools or manual
preferences form. The server persists `brief_draft` and increments
`brief_revision`. The UI polls interview/preview-ready sessions every five seconds,
displays the durable spec read-only, and sends
`POST /generate {brief_revision,brief_confirmed:true}` on the optional Generate
button. Chat approval can also start generation through the server ability.
A stale revision refetches the draft for review. Old sessions with only `brief`
show it as a previous brief and require a new agent draft before generation.
Design direction never replaces the snapshot's content or facts.

The initial canvas centers interview/brief content. Original comparison is
optional and uses the current stylesheet plus `theme`, `hide_banners=true`,
`iframe=true` and the site's `frame-nonce` if available, matching native theme
preview. Without a current stylesheet the comparison is unavailable. No raw live
iframe is mounted during the interview.

The run endpoints use `/wpcom/v2/sites/{id}/site-redesign/{redesign_id}`.
Generating/applying runs poll every three seconds. GET `/preview` includes
`path` and `generation_id`. Server HTML renders verbatim in
`iframe sandbox="allow-scripts" srcDoc`. Only the exact CSP-hashed static server
bridge can run; user scripts are blocked and the frame has an opaque origin.
The bridge sends `{source:"site-redesign-preview",type:"navigate",generation_id,href}`.
The parent validates the frame window, current generation, same site origin and
route whitelist. Relative hrefs resolve against the current site route.

Use this design explicitly POSTs `/apply {generation_id}`. Only its 402
`site_redesign_upgrade_required` response can open checkout, using a validated
same-origin URL. Checkout returns `?redesign=…&resume=apply` and requires another
explicit click. Async apply errors return to `preview_ready`; source changes
require explicit `allow_source_changes:true`. Sampling/unsupported notices use
server counts. Undo POSTs `/rollback` only when `applied.can_rollback` is true.
There are at most two generation retries per brief revision and no interview upsell banners.

Start a new brief creates a fresh owned run and empty native conversation.
Successor polling clears the old brief/preview and waits for native
`startNewChat()` to acknowledge abort/removal/session cleanup before binding the
new provider. Reset timeouts fail closed. Paid checkout returns cannot create or
restart runs, and missing/superseded candidates return to Themes.

## Testing

- Run `yarn test-client client/my-sites/site-redesign` and affected theme/layout tests.
- Calypso: `yarn start` with Node 24 and enable the feature through local overrides.
  Open an eligible Free site's Design Your Own card. Check the actual native
  dark chat and composer at desktop/mobile sizes, server interview/durable brief,
  explicit confirmation, generation failure, original/new comparison, site switch,
  checkout return, and explicit apply/undo.
- Simple/Atomic: sandbox `widgets.wp.com`, then `yarn dev --sync` from
  `apps/agents-manager`. Ordinary docked/floating chats must retain docking,
  close/minimize controls, theme-dependent suggestions, and credit meters.
