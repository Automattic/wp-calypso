Video Storage
=============

This component is used to display the remaining video storage limits.
This is useful for Jetpack sites using VideoPress, which use media storage on
WordPress.com to host videos.

Internally this component leverages the same `PlanStorageBar` component used by `PlanStorage`.

No devdocs example has been provided as this connected component works in a very specific
environment. See the [PlanStorage example], output will be very similar or identical.

#### Usage:

```javascript
import VideoStorage form 'blocks/video-storage';

<VideoStorage siteId={ siteId } />
```

#### Props

* `siteId`: `number` A site ID (required).
* `className`: `string` A class to be added to the element (optional).

[PlanStorage example]: https://wpcalypso.wordpress.com/devdocs/blocks/plan-storage
