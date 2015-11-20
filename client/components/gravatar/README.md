Gravatar
======

This component is used to display the [Gravatar](https://gravatar.com/) for a user. It takes a User object as a prop and read the images from user.avatar_URL. The images size is set at 96px, used at smaller sizes for retina display. Using one size allows us to only request one image and cache it on the browser. Even if you are displaying it at smaller sizes you should not change the source image.

#### How to use:

```js
var Gravatar = require( 'components/gravatar' );

render: function() {
    return (
        <Gravatar user={ post.author } />
    );
}
```

#### Props

* `user`: a User object. Not passing a user puts the component in "placeholder" mode.
* `alt`: (default: User's display_name) By default the alt text will be User's name, but this can be overridden.
* `size`: (default: 32) change the requested icon size.
* `imgSize`: (default: 96) change the source image size. This should not be changed unless there's a valid requirement, as 96 is most commonly cached.
