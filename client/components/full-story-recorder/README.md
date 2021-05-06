# FullStory Recorder Component

This component is used to start recording the page it rendered to with [FullStory](https://www.fullstory.com), a user session tracking tool. Because user session tracking is a powerful tool care is taken to minimize when tracking is activated. The following rules are enforced:

1. Tracking can only happen when the `fullstory` feature flag is enabled
2. Tracking can only happen when their is a logged-in user from a `US` region
3. Tracking must end when the component is un-mounted.

To track a flow the component can be included on each page. In testing, shuting down and restarting tracking between different pages happens quick enough that it should appear seamless in FullStory's dashboard.

## Props

- **record** ( boolean, defaults to `true` ) : if the component should record. This can be used to further stop recording until an additional condition is true ( button press, content loaded, etc. )

## See Also

- [`AnalyticsSafeContainer`](../analytics-safe-container/README.md)
