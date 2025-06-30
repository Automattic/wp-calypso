# useRecommendedContent Hook

This hook provides functionality for managing recommended content (feeds and sites) in the user's recommended blogs list.

## API

### `useRecommendedContent(options: UseRecommendedContentOptions)`

Hook that supports both feeds and sites.

#### Parameters

- `options.contentType`: `'feed' | 'site'` - The type of content to recommend
- `options.contentId`: `number` - The ID of the content (feedId for feeds, siteId for sites)

#### Returns

- `isRecommended`: `boolean` - Whether the content is currently recommended
- `isUpdating`: `boolean` - Whether a recommendation update is in progress
- `canToggle`: `boolean` - Whether the user can toggle the recommendation
- `toggleRecommended`: `() => void` - Function to toggle the recommendation state

## Features

- **Optimistic Updates**: Provides immediate visual feedback while the API request is in progress
- **Dual Content Support**: Handles both feeds and sites with appropriate actions
- **Error Handling**: Shows appropriate error messages if operations fail
- **Type Safety**: Full TypeScript support with proper types 
