# Gravatar Caterpillar

This component is used to display a row of [gravatars](https://gravatar.com/) for a number of users.

On smaller screens (<660px wide), the component will display half the maximum number of gravatars.

## How to use

```js
import GravatarCaterpillar from 'calypso/components/gravatar-caterpillar';

function render() {
	return <GravatarCaterpillar users={ users } />;
}
```

## Props

- `users`: an array of users. Required keys: avatar_url, email
- `maxGravatarsToDisplay`: maximum number of gravatars to display. Defaults to 10.
- `onClick`: click handler
