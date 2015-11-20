StatUpdateIndicator
===================

`StatUpdateIndicator` is a client component designed to subtly indicate to the user that a "stat" or "metric" has changed or is displaying a new value.


### Usage
It was made in conjunction with the [`PostTotalViews` component](/client/my-sites/posts/post-total-views.jsx)
(which is used in the
[`MySites` posts list](/client/my-sites/posts/post.jsx#L312)),
but could be used in other components with similar goals.

Example:
```JSX
<StatUpdateIndicator updateOn={ someScalarValue }>{
    someNumericOrTextualMetricProbably
}</StatUpdateIndicator>
```

* `StatUpdateIndicator` essentially wraps its (essential) children in a `span`.
It is an error to use it in a "self-closing" manner. e.g. don't do this:
  
  <s>`<StatUpdateIndicator updateOn={ itDoesntMatter } />`</s>

* `updateOn` is a required property (string, number, or boolean).
When it changes, the `is-updating` class is applied to the span for a time.

### Todos
* Consider moving default styles into the jsx component proper
* Accept customizable [style](style.scss) directives via component props -- including:
  * color(s)
  * effect [timeout](index.jsx#L54),
  * transition
  * etc.
