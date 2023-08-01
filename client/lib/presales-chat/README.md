# Presales Chat Hook

This package provides a set of hooks to manage the status and availability of a presales chat.

## Overview

The main hook exported by this package is `usePresalesChat`. This hook manages the chat's availability and status based on the user's locale, their connection to Zendesk, and other criteria.

The package also exports a `KeyType` type, which represents the possible chat configurations.

## KeyType

The `KeyType` is a string union type, which can be one of the following: `'akismet'`, `'jpAgency'`, `'jpCheckout'`, `'jpGeneral'`, or `'wpcom'`.

## Hooks

### usePresalesChat

The `usePresalesChat` hook is called with the following arguments:

- `keyType: KeyType` - This is the configuration type for the chat.
- `enabled: boolean` - This is a flag that indicates whether the chat is enabled. Defaults to `true`.
- `skipAvailabilityCheck: boolean` - If `true`, the hook will skip the check for chat availability. Defaults to `false`.
- `skipEligibilityCheck: boolean` - If `true`, the hook will skip the check for chat eligibility. Defaults to `false`.

The hook returns an object with the following properties:

- `isChatActive: boolean` - This indicates whether the chat is currently active.
- `isLoading: boolean` - This indicates whether the chat availability is currently being checked.
- `isPresalesChatAvailable: boolean` - This indicates whether the presales chat is available.

### usePresalesChatWithOptions

The `usePresalesChatWithOptions` hook provides a more readable and maintainable way to call `usePresalesChat`, while allowing backward compatibility with the original usePresalesChat hook. It takes the following arguments:

- `keyType: KeyType` - This is the configuration type for the chat.
- `options: object` - An optional object that can contain the following properties:
  - `enabled: boolean` - This is a flag that indicates whether the chat is enabled. Defaults to `true`.
  - `skipAvailabilityCheck: boolean` - If `true`, the hook will skip the check for chat availability. Defaults to `false`.
  - `skipEligibilityCheck: boolean` - If `true`, the hook will skip the check for chat eligibility. Defaults to `false`.

This hook internally calls `usePresalesChat`, passing it the properties from the `options` object.

## Example Usage

Here is an example of how to use the `usePresalesChatWithOptions` hook:

<!-- eslint-disable -->

```javascript
usePresalesChatWithOptions( 'jpGeneral', {
	enabled: true,
	skipAvailabilityCheck: false,
	skipEligibilityCheck: true,
} );
```
