# PodcastIndicator

## Usage

```js
import PodcastIndicator from 'calypso/components/podcast-indicator';

<PodcastIndicator size={ 24 } />;
```

## Props

- `size` **(Number) (optional)** Determines Gridicon size. Defaults to `18`.
- `tooltipType` **(String) (optional)**
  - Set to `'category'` to show a tooltip explaining the presence of this indicator in a list of categories (this is the default value).
  - Set to `'episode'` to show a tooltip explaining the presence of this indicator for an individual post.
  - Set to `null` to not show a tooltip at all.
