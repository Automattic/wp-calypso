# Subscriptions Hooks

This directory contains React hooks for managing subscription-related functionality in the WordPress.com Subscriptions page.

## Overview

### `useRecommendedSite`

A custom hook for managing recommended site state with optimistic updates and automatic error recovery using the established `bypassDataLayer` pattern.

**Key Features:**
- ✅ **Redux-Level Optimistic Updates**: Immediate state changes in Redux reducer
- ✅ **Automatic Error Recovery**: Uses `bypassDataLayer` to revert failed operations  
- ✅ **Proper Toggle Reversion**: Toggle correctly reverts to previous state on error
- ✅ **Battle-Tested Pattern**: Same approach used for comment likes, post subscriptions, etc.
- ✅ **Simplified Implementation**: No custom error tracking needed

## Usage

### Basic Usage

```typescript
import { useRecommendedSite } from 'calypso/landing/subscriptions/hooks/use-recommended-site';

function SiteRow( { feedId } ) {
	const { isRecommended, isUpdating, canToggle, toggleRecommended } = useRecommendedSite( feedId );

	return (
		<button 
			onClick={ toggleRecommended }
			disabled={ ! canToggle || isUpdating }
		>
			{ isRecommended ? 'Remove from recommended' : 'Add to recommended' }
		</button>
	);
}
```

### Real-World Example

```typescript
// From client/landing/subscriptions/components/site-subscriptions-list/site-subscription-row.tsx
const SiteSubscriptionRow = ( { feed_ID: feedId, /* other props */ } ) => {
	const { isRecommended, toggleRecommended } = useRecommendedSite( Number( feedId ) );

	return (
		<div className="subscription-row">
			{/* Site info */}
			<Toggle
				checked={ isRecommended }
				onChange={ toggleRecommended }
				label="Recommended blog"
			/>
		</div>
	);
};
```

## API Reference

### `useRecommendedSite(feedId: number)`

**Parameters:**
- `feedId: number` - The feed ID to manage recommendations for

**Returns:** `UseRecommendedSiteResult`

```typescript
interface UseRecommendedSiteResult {
	isRecommended: boolean;    // Current recommendation state (from Redux)
	isUpdating: boolean;       // Whether operation is in progress  
	canToggle: boolean;        // Whether toggle is allowed
	toggleRecommended: () => void; // Function to toggle state
}
```

## Error Recovery Flow

The implementation uses the established WordPress.com `bypassDataLayer` pattern:

### Successful Operation
```
1. User toggles → READER_LIST_ITEM_ADD_FEED dispatched
2. Reducer immediately adds feed (optimistic update)
3. API succeeds → READER_LIST_ITEM_ADD_FEED_RECEIVE ensures feed is in list
4. UI shows new state ✅
```

### Failed Operation with Automatic Recovery
```
1. User toggles → READER_LIST_ITEM_ADD_FEED dispatched  
2. Reducer immediately adds feed (optimistic update)
3. API fails → Data layer dispatches bypassDataLayer(READER_LIST_ITEM_DELETE_FEED)
4. Reducer removes feed, reverting to original state
5. UI automatically reverts toggle to previous position ✅
6. Error notice shown to user
```

## Architecture

### Redux State Management

The solution implements optimistic updates at the Redux level:

**Reducer Changes:**
- `READER_LIST_ITEM_ADD_FEED` → Immediately adds feed to list
- `READER_LIST_ITEM_DELETE_FEED` → Immediately removes feed from list  
- `bypassDataLayer` on error → Automatically reverts optimistic changes

**Data Layer Error Handlers:**
```javascript
// Add operation fails
onError: (action) => [
  errorNotice(errorMessage),
  bypassDataLayer({
    type: READER_LIST_ITEM_DELETE_FEED,  // Revert add operation
    listId: action.listId,
    feedId: action.feedId,
    // ... other params
  })
]

// Remove operation fails  
onError: (action) => [
  errorNotice(errorMessage),
  bypassDataLayer({
    type: READER_LIST_ITEM_ADD_FEED,     // Revert remove operation
    listId: action.listId,
    feedId: action.feedId,
    // ... other params
  })
]
```

### Hook Simplification

The hook is now much simpler since Redux handles optimistic updates:

- ❌ **Removed**: Custom optimistic state (`optimisticRecommendedState`)  
- ❌ **Removed**: State synchronization logic (`useEffect`)
- ❌ **Removed**: Race condition handling
- ✅ **Simplified**: Direct consumption of Redux state
- ✅ **Reliable**: Automatic error recovery via established patterns

## Requirements

### Dependencies

- User must be logged in (`getCurrentUserName` returns a string)
- User must have a "recommended-blogs" list
- Valid `feedId` must be provided

### Redux State

The hook requires the following Redux state:

- `state.currentUser` - For user authentication
- `state.reader.lists` - For recommended blogs list data

### Actions

The hook dispatches these actions:

- `addRecommendedBlogsSite` - Add feed to recommended list (triggers optimistic update)
- `removeRecommendedBlogsSite` - Remove feed from recommended list (triggers optimistic update)

## Error Handling

### Automatic Error Recovery ✅

**Toggle Reversion:** The toggle now correctly reverts to its previous state when operations fail:

- **Add fails:** Toggle reverts from checked → unchecked  
- **Remove fails:** Toggle reverts from unchecked → checked

**How it works:**
1. Redux reducer optimistically updates state immediately
2. On API error, `bypassDataLayer` dispatches the opposite action  
3. Reducer processes revert action, returning to original state
4. Hook re-renders with reverted state from Redux selector
5. Toggle UI automatically reflects the reverted state

### Error Detection

Errors are handled at the data layer level in:
- `client/state/data-layer/wpcom/read/lists/feeds/new/index.js`
- `client/state/data-layer/wpcom/read/lists/feeds/delete/index.js`

These handlers dispatch `bypassDataLayer` actions on error, which automatically revert optimistic updates in the reducer.

## Testing

### Running Tests

```bash
yarn test-client client/landing/subscriptions/hooks/test/use-recommended-site.test.ts
yarn test-client client/state/reader/lists/test/reducer.js
```

### Test Coverage

The test suite covers:

- ✅ Basic functionality (state, toggling, permissions)
- ✅ Redux integration (state changes, selector behavior)
- ✅ Action dispatching (correct actions with proper parameters)
- ✅ Edge cases (missing data, permissions)

**Note:** Error recovery is tested at the Redux layer level since it's handled by the reducer and data layer handlers.

## Performance Considerations

The hook is optimized for performance:

- **No custom state management** - leverages Redux optimistic updates
- **Memoized selectors** prevent unnecessary re-renders
- **Efficient Redux subscriptions** only re-run when relevant state changes
- **Minimal re-renders** via proper useCallback dependencies

## Related Files

### Core Implementation
- `client/landing/subscriptions/hooks/use-recommended-site.ts` - Simplified hook
- `client/state/reader/lists/reducer.js` - **Enhanced with optimistic updates**
- `client/state/reader/lists/actions.ts` - Redux actions
- `client/state/reader/lists/selectors.js` - Redux selectors

### Data Layer (Error Recovery)
- `client/state/data-layer/wpcom/read/lists/feeds/new/index.js` - **Enhanced with bypassDataLayer**
- `client/state/data-layer/wpcom/read/lists/feeds/delete/index.js` - **Enhanced with bypassDataLayer**

### Usage
- `client/landing/subscriptions/components/site-subscriptions-list/site-subscription-row.tsx` - Main usage

### Tests  
- `client/landing/subscriptions/hooks/test/use-recommended-site.test.ts` - Hook tests
- `client/state/reader/lists/test/reducer.js` - Reducer tests (validates optimistic updates)

## Changelog

### v2.0 - bypassDataLayer Implementation with Redux Optimistic Updates ✅
- ✅ **Fixed Toggle Reversion** - Toggle now correctly reverts on error
- ✅ **Added Redux-Level Optimistic Updates** - `READER_LIST_ITEM_ADD_FEED` immediately updates state
- ✅ **Implemented bypassDataLayer Error Recovery** - Automatic reversion using established patterns
- ✅ **Simplified Hook** - Removed 60+ lines of custom error handling code
- ✅ **Better Consistency** - Same pattern as comment likes, post subscriptions, etc.
- ✅ **Improved Reliability** - Battle-tested error recovery mechanism

### v1.0 - Custom Error Handling (Deprecated)  
- ❌ Custom error tracking with timestamps and race condition handling
- ❌ Hook-level optimistic updates with manual error recovery
- ❌ Toggle reversion issues for remove operations
