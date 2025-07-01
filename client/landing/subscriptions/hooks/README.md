# Subscriptions Hooks

This directory contains React hooks for managing subscription-related functionality in the WordPress.com Subscriptions page.

## Overview

### `useRecommendedSite`

A custom hook for managing recommended site state with optimistic updates and automatic error recovery. Note that sites are actually "feeds."

## Real-World Example

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

## Testing

### Running Tests

```bash
yarn test-client client/landing/subscriptions/hooks/test/use-recommended-site.test.ts
yarn test-client client/state/reader/lists/test/reducer.js
```

## Related Files

See `client/state/reader/lists/`
