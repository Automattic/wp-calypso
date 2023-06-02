# Git Workflow

## [Branch Naming Scheme](#branch-naming-scheme)

All changes should be developed in a new branch created from the `trunk` branch.

Branches use the following naming conventions:

- `add/{something}` -- When you are adding a completely new feature
- `update/{something}` -- When you are iterating on an existing feature
- `fix/{something}` -- When you are fixing something broken in a feature
- `try/{something}` -- When you are trying out an idea and want feedback

For example, you can run: `git checkout trunk` and then `git checkout -b fix/whatsits` to create a new `fix/whatsits` branch off of `origin/trunk`.

**warning**: Using multiple slashes causes problems with Calypso Live testing. See: [Git branches with multiple slashes](https://stackoverflow.com/questions/2527355/using-the-slash-character-in-git-branch-name). Stick to a single slash.

## Short Branches: Merge Early and Often

Calypso is a fast moving codebase like the existing WordPress.com codebase with lots of developers all working together. In order to avoid lots of conflicts, to make sure the code works together, and to make the code review process easier, we strongly encourage that branches are small and short-lived. A branch that only has one small commit is perfectly fine and normal.

For larger features, keeping branches small requires hiding work-in-progress (WIP) functionality behind feature switches. So in the config settings for each environment (the json files inside `/config`) there is a "features" array that you can use to enable/disable certain features for a particular environment. For more on configs, see [config/README.md](../config/README.md).

## Keeping Your Branch Up To Date

Feel free to use `git rebase trunk` or `git merge trunk` to keep your branch up to date. Each strategy has its own pros and cons (see some conversation in [Automattic/wp-calypso#66167](https://github.com/Automattic/wp-calypso/pull/66167)), so the developer can decide which they prefer. Because we "Squash and merge" when landing pull requests, history is collapsed to a single commit in both cases.

If you have a Pull Request branch that cannot be merged into `trunk` due to a conflict (this can happen for long-running Pull Request discussions), you can rebase the branch (rather than merge) and resolve any conflicts on your local copy. Once you have resolved any conflicts locally you can update the Pull Request with `git push --force-with-lease` (note: we prefer using `--force-with-lease` over `--force` to help protect remote commits).

**Be aware** that a force-push will still **replace** (overwrite) any commits currently in your shared branch, so anyone who is also using that branch will be in trouble. Only use `git push --force-with-lease` if the Pull Request is ready to merge and no one else is using it (or if you have coordinated the force-push with the other developers working on the branch).
