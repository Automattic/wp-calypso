#  Reader Hooks

This directory contains React hooks for managing the list of recommend feeds from the current user.

## Overview

### `useFeedRecommendationsMutation`

A custom hook for managing recommended sites state with optimistic updates and automatic error recovery. Note that sites are actually "feeds."

## Real-World Example

```typescript
const SiteSubscriptionRow = ( { feed_ID: feedId, /* other props */ } ) => {
	const { isRecommended, toggleRecommended } = useFeedRecommendationsMutation( Number( feedId ) );

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

### `useFeedRecommendationsMutation(feedId: number)`

**Parameters:**
- `feedId: number` - The feed ID to manage recommendations for

**Returns:** `useFeedRecommendationsMutationResult`

```typescript
interface useFeedRecommendationsMutationResult {
	isRecommended: boolean;    // Current recommendation state, derived from React Query cache
	isUpdating: boolean;       // Whether operation is in progress
	canToggle: boolean;        // Whether toggle is allowed
	toggleRecommended: () => void; // Function to toggle state
}
```

## Behavior

`useFeedRecommendationsMutation` reads the recommended-blogs list items from
React Query (`readListItemsAllQuery`) and toggles membership through
`addReadListFeedMutation` / `deleteReadListFeedMutation`. Both mutations apply
optimistic updates against the same query cache and roll back on failure, so
the UI reverts automatically when the API call errors out. Success/failure
notices are dispatched from the consumer.

## Testing

```bash
yarn test-client client/data/reader/use-feed-recommendations-mutation
```
