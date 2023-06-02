# Stats Overview

This component creates Stats Overview which is what renders each site section on www.wordpress.com/stats when a user has more than 1 site.

## How to use

```js
import StatsOverview from 'calypso/my-sites/stats/overview';

const MyComponent = () => {
	return <StatsOverview site={ site /*object*/ } path={ path /*string*/ } />;
};
```

## Required Props

- `site`: A Site Object
- `path`: String used to build out the various links to the site
