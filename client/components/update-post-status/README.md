update-post-status
==================

Originally a mixin, this higher-order component (HoC) holds common methods for updating the status of a `post` or `page`.

Note that `ReactCSSTransitionGroup` must be **already mounted** in the DOM for animations to trigger.

**Example**

```js
class Post extends Component {
  publish = () => {
    this.props.updatePostStatus( 'publish' );
  }

  render() {
    return (
      <div>
        …
        <button onClick={ this.publish } />
        …
        <ReactCSSTransitionGroup
          transitionName="updated-trans"
          transitionEnterTimeout={ 300 }
          transitionLeaveTimeout={ 300 }>
          { this.props.buildUpdateTemplate() }
        </ReactCSSTransitionGroup>
    );
  }
}

export default updatePostStatus( Post );
```

## updatePostStatus( status )
This method is used to update the page/post according to user action. It handles the UX to display a confirmation or error message appropriately.

## buildUpdateTemplate()
This method is used inside the render method of the post/page to dynamically display a confirmation to the user when necessary.
