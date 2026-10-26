# WebMCP

`@automattic/webmcp` registers browser tools alongside tools already supplied by WordPress or other
scripts. It uses `document.modelContext`, with a fallback to the older `navigator.modelContext`.
It does not install a browser API or replace the page's registry.

```ts
import { createWebMcpToolRegistry, getWebMcpModelContext } from '@automattic/webmcp';

const modelContext = getWebMcpModelContext();
if ( modelContext ) {
	const registry = createWebMcpToolRegistry( {
		modelContext,
		getTools: () => toolsForCurrentPage,
	} );
	registry.sync().catch( reportError );
	// Call sync after the available tools change, and dispose when their owner unmounts.
}
```

Each registry owns only the tools it successfully registers. Synchronization keeps unchanged
registrations, updates changed descriptors, and aborts registrations that leave the supplied list.
Disposal aborts pending and active registrations. Saved callbacks reject after their registration
ends. An action already running may still complete unless it supports cancellation itself.

Tool names must be distinct from other providers. A rejected registration does not stop the other
tools from registering; `sync()` rejects afterward so the caller can report the failure. Callers
must catch that rejection and keep the normal UI independent of WebMCP.

Tool descriptors use the browser's WebMCP shape and preserve annotations unchanged. The package has
no dependency on Agents Manager, the WordPress abilities registry, or the experimental `wpai.webmcp`
API. Those integrations supply their own tools and execution callbacks.

## Playground onboarding

Open `/setup/onboarding/playground/` in a WebMCP-capable browser. The page loads
Playground's existing tools and its WordPress tool proxy, plus `wpcom_launch_site`. This tool uses
the same action as the page's launch button: it continues to signup and preserves the Playground
site.

The onboarding account screen offers `wpcom_get_auth_options`,
`wpcom_open_email_signup`, and `wpcom_open_login`. These report the current signup methods,
show the email form, or follow the existing login link with the onboarding return destination.
They do not read credentials, submit forms, create accounts, or accept terms. These tools are
available wherever the signup form appears, except when editing an existing account's email.
The tools are removed when the account form unmounts.

Across Stepper flows, `wpcom_get_current_account` reads the active account ID, username, email,
and email-verification status from `/me`. Check this after signup or login; advancing to the next
screen alone does not establish which account is authenticated.

WebMCP registration has no feature flag, flow allowlist, or query-parameter opt-in. Each screen
registers its tools when mounted in a supported browser and removes them when they no longer apply.

The active email form also offers `wpcom_register_account`, which accepts `email` and
`acceptTermsOfService: true`. It uses the form's account-creation handler, including email
validation, submission locks, and anti-abuse checks. The account owner must agree to the terms
shown on screen before it is called. Hiding the form or leaving signup removes this tool.

On the email-login screen, `wpcom_request_email_login` accepts `emailOrUsername` and requests a
login link for an existing account. It retains the onboarding return destination and does not
create an account. Open the received link in the same browser to finish authentication.

`@automattic/webmcp/playground` connects a Playground client with a caller-owned abort signal.
Aborting it removes the Playground registrations and stops the WordPress proxy. The local patch
to `@wp-playground/mcp` adds this signal option and fixes its client declaration export. The
Playground type packages and logger are explicit dependencies because its published client does
not declare them. Renaming a Playground during onboarding returns an unsupported-operation error.

For a manual check, run local Calypso and open the route above in the built-in browser. Discover
the page's Site tools, call `playground_get_site_info`, then call `wpcom_launch_site`. Signup should
open and the Playground tools should disappear. The regular launch button should also work.

When launch opens the account screen, call `wpcom_get_auth_options` and compare the returned
methods with the screen. Call `wpcom_open_email_signup` twice: the email form should stay open
without submitting. Call `wpcom_open_login` and check that its return destination retains the
Playground ID. Complete login manually with a test account, then verify that onboarding
resumes with the same Playground.

For a registration check, use `wpcom_open_email_signup` and discover `wpcom_register_account`.
Verify that invalid input returns an error without submitting. After the account owner agrees
to the terms, call it with an unused email and verify that signup advances or shows its error or
challenge. Read verification email through a connected inbox when needed. Drive test actions
through WebMCP and inspect the rendered page to confirm the result.

To check upstream compatibility, install the preview from
[WordPress/ai#1081](https://github.com/WordPress/ai/pull/1081) in the disposable Playground, enable
its WebMCP experiment, and open a post editor. Its `editor-*` tools should appear alongside the
Playground and Dotcom tools. Set a draft title or insert a paragraph, verify the visible change,
then undo it. This plugin is only needed for the compatibility check.
