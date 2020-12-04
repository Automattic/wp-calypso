# EnvironmentBadge

Adds a little development helper badge to the bottom of the screen, which provides a link for feedback.
When expanded, it also provides information such as a link to documentation, and a list of currently active A/B tests.
In the `development` environment, it also displays the current branch name.

![Badge](https://cldup.com/eS40s3u70a.png)

The component already provides a few helpers which are used for Calypso e.g. _PreferencesHelper_ or _TestHelper_ which are located in the same file.

## Usage

```jsx
import EnvironmentBadge, { PreferencesHelper } from 'calypso/components/environment-badge';

<EnvironmentBadge badge="development" feedbackURL="http://feedback">
	<PreferencesHelper />
</EnvironmentBadge>;
```

## Props

- `badge` – mirrors the environment e.g. dev or staging:
- `feedbackURL` – link to the feedback tracker e.g. github issues
- `children` (optional) – Any children elements which extend the badge and are being rendered next to it
