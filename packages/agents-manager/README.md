# @automattic/agents-manager

AI agent manager for WordPress and Calypso.

## Installation

An internal workspace package, not published to npm — add `@automattic/agents-manager` as a dependency in the consuming `wp-calypso` workspace (used by Calypso, the Dashboard, `apps/agents-manager`, Help Center and Image Studio).

## Usage

### Basic Integration

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

### External Provider Extensions

Plugins register provider modules through the PHP filter `agents_manager_agent_providers` (Jetpack's `agents-manager` package). The entries reach the client as `agentsManagerData.agentProviders`, and `loadExternalProviders()` imports them.

See `src/extension-types.ts` for the tool and context provider interfaces, and `LoadedProviders` in `src/utils/load-external-providers.ts` for everything else a provider module can export, such as suggestions (and opting out of the default empty-view ones), markdown components and extensions, chat components, message transforms, abilities setup, checkpoint hooks, site-build utilities and capabilities.

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

### Window API (cross-app integration)

The Agents Manager exposes a `window.__agentsManagerActions` API and window events for controlling the UI from outside the React tree (e.g., from a host app, legacy code, or a separate bundle).

See `src/hooks/custom-actions/README.md` for details.

### URL Parameters

The host page URL can carry these query parameters:

| Parameter       | Description                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `am-fullscreen` | `am-fullscreen=1` opts into the lazy full-screen prototype for this page load (never Reader Chat). It sends the `fullscreen` environment. In Calypso and the Dashboard, the `calypso/agents-manager-internal` flag and a selected site allow loading on otherwise ineligible routes, without enabling Big Sky. |
| `ai-open`       | `ai-open=true` auto-opens the chat (docked or undocked) on page load, e.g. for links from emails. The parameter is stripped from the URL after being applied.                            |
| `agent`         | Overrides the agent ID, for testing (e.g., `?agent=wpcom-workflow-support_chat`). Ignored when the host passes an `agentId` prop.                                                        |
| `version`       | Overrides the agent version, for testing (e.g., `?version=1.0.25`).                                                                                                                      |
| `am_credits`    | Seeds a mock site-credits balance as a percentage, for demos and testing on pages without a site, outside Reader Chat (e.g., `?am_credits=55`). Read once when the chat mounts.          |
| `am_plan`       | With `am_credits`, the mock plan: `paid`, or `free` (the default).                                                                                                                       |
| `wp-agent-chat` | The chat session to resume, handed off by a same-tab link from another origin (e.g. wp-admin to Calypso) so the conversation continues there. Stripped from the URL after being applied. |
| `wp-agent-site` | The site scope of the handed-off session. The session is resumed only on pages for that site, and stored for it otherwise.                                                               |

In full-screen mode, **Referenced pages** lists same-site links from assistant replies and editor URLs from user-message context in the current session. The list uses reply link labels when available and batches title lookups for unlabeled post IDs. Site metadata, post resolution, and title requests use the WordPress.com REST proxy. Selecting a reference resolves its post ID when necessary and opens the editor in a right-hand panel (an overlay on narrow screens). Each open requests a fresh frame nonce and carries the session handoff and `am-embedded=1`. Jetpack/Atomic site-editor links use a new tab because those sites do not support framing the site editor. The embedded flag is reserved for the next phase: the editor may still show its own chat, and the panel does not yet supply tools or context to the full-screen chat.

## API Reference

### AgentsManager Props

| Prop                             | Type                                   | Description                                                                                                              |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `sectionName`                    | `string`                               | The name of the current section (e.g., 'wp-admin', 'gutenberg').                                                         |
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

### Exported Hooks and Utilities

Feedback utilities are also exported: `useFeedbackAction`, `submitFeedback`, `rateMessage`, and the `FeedbackInput` component. Chat UI actions (`openAgentsManagerChat`, `closeAgentsManagerChat`, `isAgentsManagerChatVisible`), `recordAgentsManagerTracksEvent` and `getAgentsManagerInlineData()` (the server-injected `agentsManagerData` payload) are exported as well. A host rendering its own AI chat entry button reads `useAiChatEntryState()` for `isChatVisible` and wraps its label text in `<AiChatEntryLabel>`, which shows it only while the chat is hidden.

Chats that show site credits use `formatCreditsShort()`, which gives an amount such as "800" or "8.5k" and rounds down, and `CREDITS_LOW_BALANCE`, the 10,000-credit paid-plan balance below which the credits dot turns red and the low-balance notice shows. Chats outside the dock that show the site credits dot use `CreditsMeter`, `parseLiveCreditsStatus` and `getCreditsUpgradeUrl`, which links to the same plans page as the dock. The link carries `CREDITS_UPGRADE_SOURCE` as its `source`, and Tracks events send the same value as `ref`. `CreditsMeter` calls its optional `onUpgradeClick` when someone clicks that link, so a chat can record the click. Checkout refuses an upgrade from most people who didn't buy the plan, so these chats pass that link through `getCreditsPurchaseOptions()` with the flags `parseCreditsAccess()` reads from the `/ai/credits` response. It keeps the link only when the response says `can_upgrade: true`. For people the response says can't upgrade, it gives a `purchaseHint` for `CreditsMeter` and a value to pass to `getCreditsNoticeMessage()` for the low and zero-balance notices. When the response doesn't say, it gives nothing. `getCreditsCtaType()` turns the same result into the `cta_type` that Tracks events send.

Hosts that own a dedicated AI experience can set the [document-scoped presentation configuration](src/hooks/custom-actions/README.md#document-scoped-presentation) before loading Agents Manager to keep chat open and hide wp-admin/editor entry toggles. Chat state APIs report the effective open state, and close requests are ignored while `dismissible` is `false`.

### Exported Types

```tsx
import type {
	AgentsManagerProps,
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
	UseFeedbackActionConfig,
	UseFeedbackActionReturn,
	CreditsStatus,
	CreditsAccess,
	CreditsAskToUpgrade,
	CreditsCtaType,
	CreditsPurchaseOptions,
} from '@automattic/agents-manager';
```

`Ability` is re-exported from `@wordpress/abilities`, which owns its shape. The provider interfaces are documented in `src/extension-types.ts`.

## Development

Calypso, the Dashboard and `apps/agents-manager` import `src/` directly (`calypso:src`), so no build is needed during development. See `AGENTS.md` → Testing for tests, type-checks, lint and sandbox testing. `yarn build`, `yarn watch` and `yarn clean`, run in this package, only manage `dist/`.

## License

GPL-2.0-or-later
