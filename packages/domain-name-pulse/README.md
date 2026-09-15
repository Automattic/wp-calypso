# Domain Name Pulse

Name Pulse results mode for the WordPress.com domain search: keystroke search, exact-match grid, keyword and AI suggestions.

The package is a leaf. `@automattic/domain-search` depends on it and renders `NamePulseSearch` when its `showNamePulseSearch` config is on; this package never imports `@automattic/domain-search`.

## Installation

```sh
yarn add @automattic/domain-name-pulse
```

## Usage

```tsx
import { NamePulseSearch } from '@automattic/domain-name-pulse';
```
