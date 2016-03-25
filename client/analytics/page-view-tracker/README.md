# Page View Tracking Component

Use this component to automatically record page views when they are loaded. There are two modes of operation: immediate and delayed. In the immediate mode, the page view tracking event will fire off as soon as the component mounts. In the delayed mode, the event will fire off no sooner than the given delay, and will not send at all if the component unmounts before that delay has expired.

## Examples

### Immediate Page View Tracking

```js
import PageViewTracker from 'analytics/page-view-tracker';

render() {
    return (
        <div>
            <PageViewTracker path="/my/trackers" title="tracking_dashboard" />
            <MyCoolComponent>
                <MyCoolChildren />
            </MyCoolComponent>
        </div>
    );
);
```

### Delayed Page View Tracking

```js
import PageViewTracker from 'analytics/page-view-tracker';

render() {
    // consider a view for less than 500ms as an
    // accidental view and thus don't track

    return (
        <div>
            <PageViewTracker 
                delay={ 500 } 
                path="/my/trackers" 
                title="tracking_dashboard"
            />
            <MyCoolComponent>
                <MyCoolChildren />
            </MyCoolComponent>
        </div>
    );
);
```
