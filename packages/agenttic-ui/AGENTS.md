# Agenttic UI

## Dependencies

- A dependency this package adds that no other workspace declares MUST go in the Agent rule's `matchPackageNames` in `renovate.json5`, so its updates reach the Agent team, unless Renovate updates it in a repo-wide group, such as `@storybook/*`. Remove it there when this package drops it or another workspace starts using it.
