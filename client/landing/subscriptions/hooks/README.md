# useRecommendedContent Hook

This hook provides functionality for managing recommended content (feeds and sites) in the user's recommended blogs list.

## API

### `useRecommendedContent(options: UseRecommendedContentOptions)`

Hook that supports both feeds and sites.

#### Parameters

- `options.contentType`: `'feed' | 'site'` - The type of content to recommend
- `options.contentId`: `number` - The ID of the content (feedId for feeds, siteId for sites)
- `options.fallbackSiteId?`: `number` - Optional fallback siteId when contentType is 'feed' (for backward compatibility)

#### Returns

- `isRecommended`: `boolean` - Whether the content is currently recommended
- `isUpdating`: `boolean` - Whether a recommendation update is in progress
- `canToggle`: `boolean` - Whether the user can toggle the recommendation
- `toggleRecommended`: `() => void` - Function to toggle the recommendation state

## Usage Examples

### Recommending a Feed

```tsx
import { useRecommendedContent } from 'calypso/landing/subscriptions/hooks/use-recommended-content';

function FeedRecommendButton({ feedId, siteId }) {
  const { isRecommended, isUpdating, canToggle, toggleRecommended } = useRecommendedContent({
    contentType: 'feed',
    contentId: feedId,
    fallbackSiteId: siteId, // Optional fallback for backward compatibility
  });

  return (
    <button
      onClick={toggleRecommended}
      disabled={!canToggle || isUpdating}
    >
      {isUpdating ? 'Updating...' : isRecommended ? 'Remove from recommended' : 'Add to recommended'}
    </button>
  );
}
```

### Recommending a Site

```tsx
import { useRecommendedContent } from 'calypso/landing/subscriptions/hooks/use-recommended-content';

function SiteRecommendButton({ siteId }) {
  const { isRecommended, isUpdating, canToggle, toggleRecommended } = useRecommendedContent({
    contentType: 'site',
    contentId: siteId,
  });

  return (
    <button
      onClick={toggleRecommended}
      disabled={!canToggle || isUpdating}
    >
      {isUpdating ? 'Updating...' : isRecommended ? 'Unrecommend Site' : 'Recommend Site'}
    </button>
  );
}
```

## Features

- **Optimistic Updates**: Provides immediate visual feedback while the API request is in progress
- **Dual Content Support**: Handles both feeds and sites with appropriate actions
- **Error Handling**: Shows appropriate error messages if operations fail
- **Type Safety**: Full TypeScript support with proper types 