Badge
=====

Adds a little development helper badge to the bottom of the screen, which provides a link for feedback.
When expanded, it also provides information such as a link to documentation, and a list of currently active A/B tests.
In the `development` environment, it also displays the current branch name.

Note that this means that this component **cannot be used on the client but only on the server** as it relies on both
node's `child_process` module and on `git` to be present.

![Badge](https://cldup.com/eS40s3u70a.png)

## Usage

```jsx
import Badge from 'components/badge';

<Badge />
```

## Props

None.
