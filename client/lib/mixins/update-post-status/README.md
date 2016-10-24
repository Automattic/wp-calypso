update-post-status
==================

This mixin holds common methods for updating the status of a `post` or `page`. The language can be customized for the different page and post cases by setting an object of strings to `this.strings` within the componentWillMount method.

Note that `ReactCSSTransitionGroup` must be **already mounted** in the DOM for animations to trigger.

**Example** - used in parent component

```javascript
module.exports = React.createClass({

  mixins: [ updatePostStatus ],

  render: function() {

    return (
      <div className="regular-template">Regular template stuff</div>
      <ReactCSSTransitionGroup
        transitionName="updated-trans"
        transitionEnterTimeout={ 300 }
        transitionLeaveTimeout={ 300 }>
        { this.buildUpdateTemplate() }
      </ReactCSSTransitionGroup>
    );

  }

});
```

## updatePostStatus( status )
This method is used to update the page/post according to user action. It handles the UX to display a confirmation or error message appropriately.

## buildUpdateTemplate()
This method is used inside the render method of the post/page to dynamically display a confirmation to the user when necessary.
