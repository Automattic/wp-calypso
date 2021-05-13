# Gravatar

This component is used to display the [Gravatar](https://gravatar.com/) for a user. It takes a User object as a prop and read the images from user.avatar_URL.

If the current user has uploaded a new Gravatar recently on Calypso, and therefore has a temporary image set, this component will display the temporary image instead. It reads the temporary image using the redux selector `getUserTempGravatar`.

The images size is set at 96px, used at smaller sizes for retina display. Using one size allows us to only request one image and cache it on the browser. Even if you are displaying it at smaller sizes you should not change the source image.

## How to use

```js
import Gravatar from 'calypso/components/gravatar';

function render() {
	return <Gravatar user={ post.author } />;
}
```

## Props

- `user`: a User object. Not passing a user puts the component in "placeholder" mode.
- `alt`: (default: User's display_name) By default the alt text will be User's name, but this can be overridden.
- `size`: (default: 32) change the requested icon size.
- `imgSize`: (default: 96) change the source image size. This should not be changed unless there's a valid requirement, as 96 is most commonly cached.
