# @automattic/survicate

Shared utilities for integrating [Survicate](https://survicate.com/) surveys into WordPress.com clients.

This package extracts the core Survicate logic (condition checks, script loading, and visitor trait setting) so that multiple clients (Calypso, Multi-site Dashboard, etc.) can share the same implementation.

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
