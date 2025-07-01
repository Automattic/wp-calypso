# useRecommendedSite Hook

A React hook for managing recommended site state with optimistic updates and error recovery in WordPress.com.

## Overview

The `useRecommendedSite` hook provides functionality to add or remove feeds from a user's "recommended blogs" list. It includes optimistic UI updates for immediate feedback and automatic error recovery when operations fail.

## Features

- ✅ **Optimistic Updates**: Immediate UI feedback while API calls are in progress
- ✅ **Error Recovery**: Automatic state reversion when operations fail
- ✅ **Race Condition Handling**: Prevents state conflicts with delayed error detection
- ✅ **Type Safety**: Full TypeScript support with proper interfaces
- ✅ **Performance Optimized**: Memoized selectors and callbacks

## Usage

### Basic Usage

```typescript
import { useRecommendedSite } from 'calypso/landing/subscriptions/hooks/use-recommended-site';

function MyComponent() {
  const { isRecommended, isUpdating, canToggle, toggleRecommended } = useRecommendedSite(feedId);

  return (
    <button
      onClick={toggleRecommended}
      disabled={!canToggle || isUpdating}
    >
      {isRecommended ? 'Remove from recommendations' : 'Add to recommendations'}
    </button>
  );
}
```

### Real-world Example

```typescript
import { FormToggle } from '@wordpress/components';
import { useRecommendedSite } from 'calypso/landing/subscriptions/hooks/use-recommended-site';

function SiteRecommendationToggle({ feedId, siteName }) {
  const { isRecommended, isUpdating, canToggle, toggleRecommended } = useRecommendedSite(feedId);

  const handleToggle = () => {
    toggleRecommended();
    
    // Optional: Record analytics event
    recordEvent('recommended_site_toggled', {
      feed_id: feedId,
      recommended: !isRecommended
    });
  };

  return (
    <FormToggle
      aria-label={`Recommend ${siteName} to other users`}
      checked={isRecommended}
      onChange={handleToggle}
      disabled={!canToggle || isUpdating}
    />
  );
}
```

## API Reference

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `feedId` | `number` | Yes | The feed ID to add/remove from recommended blogs list |

### Return Value

The hook returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `isRecommended` | `boolean` | Whether the feed is currently in the recommended list |
| `isUpdating` | `boolean` | Whether an add/remove operation is in progress |
| `canToggle` | `boolean` | Whether the toggle operation is available (user logged in, etc.) |
| `toggleRecommended` | `() => void` | Function to toggle the recommendation state |

### TypeScript Interface

```typescript
interface UseRecommendedSiteResult {
  isRecommended: boolean;
  isUpdating: boolean;
  canToggle: boolean;
  toggleRecommended: () => void;
}
```

## State Management

### Optimistic Updates

The hook provides immediate UI feedback by updating the local state before the API call completes:

1. User clicks toggle → UI updates immediately
2. API call is dispatched in background  
3. On success → optimistic state is cleared, Redux state takes over
4. On error → optimistic state reverts to original value

### Error Recovery

When API operations fail, the hook automatically reverts the UI to the previous state:

```typescript
// Before toggle: isRecommended = false
toggleRecommended(); // UI immediately shows: isRecommended = true

// If API fails: UI reverts to: isRecommended = false
// User sees the original state, indicating the operation failed
```

### Race Condition Prevention

The hook includes a 1-second delay before clearing optimistic state to prevent race conditions where errors arrive after state synchronization.

## Requirements

### Dependencies

- User must be logged in (`getCurrentUserName` returns a string)
- User must have a "recommended-blogs" list
- Valid `feedId` must be provided

### Redux State

The hook requires the following Redux state:
- `state.currentUser` - For user authentication
- `state.reader.lists` - For recommended blogs list data
- `state.reader.lists.listItemErrors` - For error tracking

### Actions

The hook dispatches these actions:
- `addRecommendedBlogsSite` - Add feed to recommended list
- `removeRecommendedBlogsSite` - Remove feed from recommended list

## Error Handling

### Automatic Error Recovery

The hook automatically handles these error scenarios:

1. **Network failures** - UI reverts to original state
2. **API errors** - UI reverts to original state  
3. **Permission errors** - UI reverts to original state
4. **Timeout errors** - UI reverts to original state

### Error Detection

Errors are detected using:
- Error actions dispatched by data layer handlers
- Timestamp matching to ensure errors correspond to current operations
- Feed ID matching to ensure errors are for the correct feed

### Manual Error Handling

You can also handle errors manually by monitoring the `isUpdating` state:

```typescript
const { isRecommended, isUpdating, toggleRecommended } = useRecommendedSite(feedId);

// Watch for state changes to detect when operations complete
useEffect(() => {
  if (!isUpdating) {
    // Operation completed (success or failure)
    // Check if state matches expectation to detect errors
  }
}, [isUpdating]);
```

## Testing

### Running Tests

```bash
npm run test-client -- --testPathPattern=use-recommended-site
```
