# Agenttic UI

## Dependencies

- A dependency that no workspace outside `agents-manager`, `agenttic-client` and `agenttic-ui` declares MUST go in the Agent rule's `matchPackageNames` in `renovate.json5`, so its updates reach the Agent team, unless Renovate updates it in a repo-wide group, such as `@storybook/*`. Remove it there once none of these packages declares it, or a workspace outside them starts using it.
