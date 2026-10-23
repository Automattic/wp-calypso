# @automattic/agents-manager

AI agent manager for WordPress and Calypso.

## Installation

An internal workspace package, not published to npm — add `@automattic/agents-manager` as a dependency in the consuming `wp-calypso` workspace (used by Calypso, the Dashboard, `apps/agents-manager`, Help Center and Image Studio).

## Usage

### Basic integration

The main component is `AgentsManager`. It handles agent initialization, session management, and UI rendering.

```tsx
import AgentsManager from '@automattic/agents-manager';

function MyApp() {
	const site = { ID: 456, domain: 'example.com', URL: 'https://example.com' };

	return (
		<AgentsManager
			sectionName="dashboard"
			site={ site }
			currentSiteId={ site.ID }
			currentRoute="/dashboard"
		/>
	);
}
```

### External providers

Plugins register provider modules through the PHP filter `agents_manager_agent_providers` (Jetpack's `agents-manager` package). The entries reach the client as `agentsManagerData.agentProviders`, and Agents Manager imports them.

See `src/extension-types.ts` for the tool and context provider interfaces, and `LoadedProviders` in `src/utils/load-external-providers.ts` for everything else a provider module can export: suggestions, markdown components and extensions, interactive UI components and functions, chat components, message transforms, task updates, abilities setup, checkpoint hooks, site-build utilities and capabilities.

### Opening and closing the chat

Use the exported chat actions. They respect the minimized state and a host's `chatPresentation`, which writing to the store directly would skip.

```tsx
import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
} from '@automattic/agents-manager';
import { __ } from '@wordpress/i18n';

function ToggleAgentButton() {
	const toggle = () =>
		isAgentsManagerChatVisible() ? closeAgentsManagerChat() : openAgentsManagerChat();

	return (
		<button type="button" onClick={ toggle }>
			{ __( 'Toggle Agent' ) }
		</button>
	);
}
```

`AGENTS_MANAGER_STORE` holds the saved UI preferences (`getAgentsManagerState()`). Its `isOpen` is the saved preference, not the effective state; use `isAgentsManagerChatVisible()` for that.

A host that renders its own AI chat entry button reads `useAiChatEntryState()` for `isChatVisible`, and wraps its label text in `<AiChatEntryLabel>`, which shows it only while the chat is hidden.

### Dedicated AI experiences

A host that owns a dedicated AI experience can set the [document-scoped presentation configuration](src/hooks/custom-actions/README.md#document-scoped-presentation) before loading Agents Manager, to keep the chat open and hide the wp-admin and editor entry toggles. The chat state APIs report the effective open state, and close requests are ignored while `dismissible` is `false`.

### Window API

Agents Manager exposes a `window.__agentsManagerActions` API and window events, to control the chat from outside its React tree: a host app, legacy code or a separate bundle. See `src/hooks/custom-actions/README.md`.

### URL parameters

The host page URL can carry these query parameters:

| Parameter       | Description                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai-open`       | `ai-open=true` opens the chat (docked or undocked) on page load, e.g. for links from emails. Stripped from the URL after being applied.                                                            |
| `agent`         | Overrides the agent ID, for testing (e.g. `?agent=wpcom-workflow-support_chat`). Ignored when the host passes an `agentId` prop.                                                                   |
| `version`       | Overrides the agent version, for testing (e.g. `?version=1.0.25`).                                                                                                                                 |
| `am_credits`    | Seeds a mock site credits balance as a percentage, for demos and testing on pages without a site, outside Reader Chat (e.g. `?am_credits=55`).                                                     |
| `am_plan`       | With `am_credits`, the mock plan: `paid`, or `free` (the default).                                                                                                                                 |
| `wp-agent-chat` | The orchestrator session to resume, handed off by a same-tab link from another origin (e.g. wp-admin to Calypso) so the conversation continues there. Stripped from the URL, with `wp-agent-site`. |
| `wp-agent-site` | The handed-off session's site. The session resumes only on pages for that site, and is stored for it otherwise.                                                                                    |

## API reference

### `AgentsManager` props

| Prop                             | Type                                   | Description                                                                                                              |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `sectionName`                    | `string`                               | The name of the current section (e.g. `wp-admin`, `gutenberg`).                                                          |
| `currentUser`                    | `CurrentUser` (optional)               | Current user (from `@automattic/data-stores`). Sets `isLoggedIn`.                                                        |
| `site`                           | `AgentsManagerSite \| null` (optional) | The selected site object (from `@automattic/data-stores`).                                                               |
| `currentRoute`                   | `string` (optional)                    | The current route path.                                                                                                  |
| `currentSiteId`                  | `number` (optional)                    | The ID of the selected site. When set, chat state is scoped to this site. When omitted, uses a shared "no-site" context. |
| `agentId`                        | `string` (optional)                    | Explicit agent ID supplied by the host.                                                                                  |
| `zendeskConversationTags`        | `string[]` (optional)                  | Zendesk conversation tags to apply when a new support conversation is created.                                           |
| `zendeskSmoochIntegrationKey`    | `string` (optional)                    | Index selecting a dedicated Smooch integration for new support conversations (e.g. `woo`).                               |
| `zendeskTicketProductFieldValue` | `string` (optional)                    | Zendesk Product ticket-field value to apply to new support conversations.                                                |
| `isInternalOnly`                 | `boolean` (optional)                   | Shows an "A8C Only" badge in the chat header when the current screen enables the agent for internal users only.          |
| `hasMasterbarAiChatButton`       | `boolean` (optional)                   | Whether the host's masterbar renders the AI chat button, so the chat minimizes to it instead of a floating bubble.       |

### Exports

Besides the default `AgentsManager` component:

- **Chat**: `openAgentsManagerChat`, `closeAgentsManagerChat`, `isAgentsManagerChatVisible` and `AGENTS_MANAGER_STORE` ([Opening and closing the chat](#opening-and-closing-the-chat)).
- **Entry button**: `useAiChatEntryState` and `AiChatEntryLabel`.
- **Feedback**: `submitFeedback`, `rateMessage` and the `FeedbackInput` component.
- **Site credits**: the balance, purchase links, notices and Tracks values other chats share with the dock ([`SITE-CREDITS.md`](./SITE-CREDITS.md)).
- **Other**: `recordAgentsManagerTracksEvent`, and `getAgentsManagerInlineData()` for the server-injected `agentsManagerData`.

Types:

```tsx
import type {
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
	CreditsStatus,
	CreditsAccess,
	CreditsCtaType,
	CreditsPurchaseAction,
	CreditsPurchaseKind,
	CreditsPurchaseLink,
	CreditsPurchaseOptions,
} from '@automattic/agents-manager';
```

`Ability` and `Suggestion` are re-exported from `@wordpress/abilities` and `@automattic/agenttic-ui`, which own their shapes. The provider interfaces are documented in `src/extension-types.ts`.

## Interactive chat surfaces

The agent can show buttons, forms and pickers in the chat. [`@automattic/ai-ui-renderer`](../ai-ui-renderer/README.md) renders them and holds only the basic or shared components; each chat's own components live in its project, such as Agents Manager, WooCommerce AI or the Jetpack AI sidebar. See [`INTERACTIVE-UI.md`](./INTERACTIVE-UI.md) for how it works.

## Development

Calypso, the Dashboard and `apps/agents-manager` import `src/` directly (`calypso:src`), so no build is needed during development. See `AGENTS.md` → Testing for tests, type-checks, lint and sandbox testing. `yarn build`, `yarn watch` and `yarn clean`, run in this package, only manage `dist/`.

## License

GPL-2.0-or-later

### Action approvals

Signed-in mounts with conversation history advertise `capabilities.action_approval`
in client context; Reader Chat never advertises it. `enableActionApprovals` opts
Agenttic into retaining the versioned display data. The action approvals hook
owns records scoped to user, site, agent, and session, keyed by
`approval:<proposalId>`. Stream events and history echoes upsert that record;
`convertActionApprovalMessages` is the only card renderer. New-chat session
bootstrap preserves records; switching scope drops them and rejects stale callbacks.

Pending proposals and active decision/continuation requests block composer,
suggestion, host, retry, regeneration, and context sends. On approval-enabled mounts, hydration disables the
composer until history is ready; other mounts retain their existing behavior. Failed continuations show an unknown outcome
and a manual retry without keeping the composer locked. Approval data is never a browser tool call.

Decisions POST with the authentication provider's headers unchanged. A successful
decision sends a hidden `approvalResume` control message; a failed continuation
can be retried without posting the decision again. Already-decided responses
reconcile the card without resuming. Scope changes abort outstanding requests.

History restores the opt-in `approvals` array returned with the existing Odie
history request, using the server's numeric `chatId`, before browser recovery.
An absent field adds no cards or requests. The list endpoint is used only to
reconcile a card after continuation. Restored pending cards
remain answerable; restored A2UI surfaces retain their existing disabled behavior.
`description` carries the site and target. Typed text never implies a decision.

Cards replace their original transcript anchors, including history tool-call
messages carrying `context.approval`; authoritative state updates retain that
position. Remounts reconcile from history: pending cards remain answerable,
approved records offer continuation-only retry, and terminal records unlock sends.
