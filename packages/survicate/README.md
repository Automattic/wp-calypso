# @automattic/survicate

Shared utilities for integrating [Survicate](https://survicate.com/) surveys into WordPress.com clients.

This package is the single Survicate implementation for WordPress.com surfaces: the Multi-site Dashboard and classic Calypso import it directly, and wp-admin on Simple and Atomic sites loads it as a `widgets.wp.com` bundle built by `apps/survicate/`. See `AGENTS.md` for the suppression model and the consumer map.

## Usage

```ts
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';

// 1. Check whether Survicate should load (English locale, non-mobile).
if ( ! shouldLoadSurvicate( { locale: 'en', isMobile: false } ) ) {
	return;
}

// 2. Inject the Survicate script tag.
await loadSurvicateScript( SURVICATE_WORKSPACE_ID );

// 3. Set visitor traits for targeting.
setSurvicateVisitorTraits( { email: 'user@example.com' } );
```

## Exports

| Export                                | Description                                                          |
| ------------------------------------- | -------------------------------------------------------------------- |
| `shouldLoadSurvicate( options )`      | Returns `true` if locale starts with `en` and `isMobile` is `false`. |
| `loadSurvicateScript( workspaceId )`  | Injects the Survicate script tag. Deduplicates concurrent calls.     |
| `isSurvicateScriptLoaded()`           | Returns whether the script is loaded or loading.                     |
| `setSurvicateVisitorTraits( traits )` | Sets visitor traits (e.g. email) on the global `_sva` object.        |
| `SURVICATE_WORKSPACE_ID`              | The WordPress.com Survicate workspace identifier.                    |
