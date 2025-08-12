# Onboarding Sessions

## What is a Session?

A session in the context of Stepper flows represents a single attempt by a user to start and go through a flow. Each session is unique and contains all the state and progress of that particular flow experience. Sessions are designed to handle several key user scenarios:

- Creating multiple sites in sequence.
- Refreshing the page without losing progress.
- Opening links in new tabs while maintaining context.
- Abandoning and returning to flows.
- Going back from checkout to modify choices.

## What is a Session ID?

A session ID is a unique identifier that's added as a query parameter to the URL of an onboarding flow. It follows the format `~XX` where X is a combination of numbers and letters (base62). For example:

```
/setup/onboarding?sessionId=~A0
```

The session ID serves several important purposes:

1. **Persistence**: It acts as a key for storing the flow state in the browser's storage.
2. **Navigation**: It maintains context when users navigate between different parts of the flow.
3. **Isolation**: It prevents interference between multiple flow attempts.

The session ID is:
- Unique to each flow attempt.
- Short (2 characters) to keep URLs clean.
- Automatically generated when starting a new flow.
- Preserved during page refreshes and navigation.
- Lost when starting a new flow or abandoning the current one.

## How Sessions are Persisted

Sessions are persisted using React Query's persistence capabilities with IndexedDB as the storage mechanism. Here's how it works:

1. **Storage Key**: The session ID is used to create a unique storage key (`query-state-${sessionId}`) in IndexedDB.
2. **State Management**: React Query manages the state of the flow, including:
   - User selections and progress.
   - API responses and cached data.
   - Flow-specific metadata.
3. **Persistence Strategy**:
   - State is automatically persisted to IndexedDB when changes occur.
   - Persistence is throttled to prevent excessive writes.
   - State is restored from IndexedDB when the flow is revisited.
4. **Cleanup**:
   - Stale sessions are automatically garbage collected after a maximum age.

## Going Back from Checkout

The session system enables a unique capability: going back from checkout to modify choices. Here's how it works:

1. When a user reaches checkout, their site is created and the session ID is preserved in the history stack of the browser.
2. If they click back or return to the flow, the session ID in the URL allows the system to:
   - Retrieve the previously created site.
   - Load all previous choices and state.
   - Allow modifications to plans, domains, or other selections.
   - Maintain context throughout the entire flow.

This is particularly useful because:
- Users can change their mind about plans or domains.
- The system remembers the created site.
- All previous choices are preserved.
- The flow maintains its context despite crossing into a different application (checkout).

The session ID is the key that makes this possible, as it persists across the checkout boundary and allows the system to reconnect the user with their previous state.