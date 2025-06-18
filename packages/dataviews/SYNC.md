# Syncing from upstream

The `@automattic/dataviews` package that lives in Calypso's repository extends the `@wordpress/dataviews` package that lives in Gutenberg's repository (also known as upstream). We regularly sync changes from upstream into Calypso to keep it up-to-date.

There are two workflows when working with this package: the regular day-to-day operations and the sync process.

- **Regular workflow**: this is calypso as you know it. DataViews is a directory in the project, its syncing process remaining invisible, anyone who wants to land a bugfix or prepare a new feature will create a new Pull Request that can touch the `packages/dataviews` directory.
- **Sync workflow**: this is a separate process that involves fetching changes from the upstream repository and merging them into Calypso. This document focuses on this workflow.

![Diagram illustrating the sync process between upstream @wordpress/dataviews and @automattic/dataviews](sync.png)

## Initial sync

This section documents how we did the [initial sync](https://github.com/Automattic/wp-calypso/pull/102276). **We don't need to repeat this process**, it's only here for full context.

1. Fetch Gutenberg (only the trunk branch).

```sh
git remote add -t trunk gutenberg git@github.com:WordPress/gutenberg.git
git fetch gutenberg --no-tags
```

2. Extract Gutenberg's packages/dataviews folder into a new branch. This branch, dataviews-trunk, will only have the contents of that folder.

```sh
git switch --detach gutenberg/trunk
git subtree split --prefix=packages/dataviews/ --branch=dataviews-trunk
```

3. Prepare a PR to merge dataviews-trunk into wp-calypso. For the initial setup, we need to connect the histories of gutenberg and wp-calypso repositories. See [git](https://www.kernel.org/pub/software/scm/git/docs/howto/using-merge-subtree.html) and [GitHub](https://docs.github.com/en/get-started/using-git/about-git-subtree-merges) docs.

```sh
git checkout -b add/dataviews-package trunk
git merge -s ours --no-commit --allow-unrelated-histories dataviews-trunk
git read-tree --prefix=packages/dataviews/ -u dataviews-trunk
git commit -m "Merge dataviews into packages/dataviews/" --no-verify
```

The `git merge ...` command: adds meta-information but doesn't bring any contents yet. The `git read-tree ...` command stores the contents of the dataviews-trunk branch into packages/dataviews folder of wp-calypso. Last, the `git commit ...` command finalizes the merge process.

4. Push branch to wp-calypso.

```sh
yarn
git commit -am "Add packages/dataviews"
git push -u origin add/dataviews-package
```

## Updates

This section documents how to perform syncs from Gutenberg's `packages/dataviews` into Calypso's `packages/dataviews` after the initial setup. Follow these steps to bring changes from upstream, we aim to do this every couple of weeks.

1. **Fetch latest changes from upstream**.

```sh
# Only add the remote if you don't have it already.
git remote add -t trunk gutenberg git@github.com:WordPress/gutenberg.git
git fetch gutenberg --no-tags
```

2. **Create or update the dataviews-trunk branch**.

```sh
git switch --detach gutenberg/trunk
git subtree split --prefix=packages/dataviews/ --branch=dataviews-trunk
```

`git switch --detach gutenberg/trunk` positions you at the exact state of the Gutenberg's trunk branch. This allows us to grab files from a specific point in the repository without creating local branches.

`git subtree split --prefix=packages/dataviews/ --branch=dataviews-trunk` extracts the Gutenberg's packages/dataviews/ folder into its own branch (dataviews-trunk), as if it were always a separate repository. This command processes the entire repository history to find commits that touched Gutenberg's `packages/dataviews/` directory, so it might take a few minutes.

3. **Prepare a PR to update wp-calypso**.

```sh
git checkout -b update/dataviews-package trunk
git merge -Xsubtree=packages/dataviews/ dataviews-trunk
```

`git checkout -b update/dataviews-package trunk` creates a new branch update/dataviews-package based on Calypso's trunk.

`git merge -Xsubtree=packages/dataviews/ dataviews-trunk` is the key step where the actual synchronization happens. It merges the dataviews-trunk branch (which you created in step 2) into the update/dataviews-package branch. The `-Xsubtree=packages/dataviews/` option tells git to place files from the dataviews-trunk branch (which are at the root level) into the `packages/dataviews/` directory of the update/dataviews-package branch.

The merge may stop if git was unable to resolve conflicts automatically. If that's the case, resolve them manually and continue the merge process (`git merge --continue`). This is expected, and it’s [how the git merge algorithm works](https://oandre.gal/git-merge/). This happens when both Calypso’s DataViews and Gutenberg’s DataViews changed the same part of a file.

Typical conflicts you may encounter when syncing from upstream:

- The `package.json` version. `@wordpress/dataviews` and `@automattic/dataviews` have each their own version sequence. When pulling changes from upstream, resolve this conflict by using the version number we maintain in this repository to release `@automattic/dataviews`.

4. **Push to wp-calypso**.

```sh
yarn
git push -u origin update/dataviews-package
```

## Merge into wp-calypso via CLI

Once the initial sync or the update is complete (there's a new Pull Request available in wp-calypso), it's time to merge the upstream changes into wp-calypso. **We need to merge the changes via a merge commit** for the histories to remain connected and subsequent updates work properly. This is how we do it:

- Create a Pull Request in wp-calypso, like you'd normally do (see "Update" section before). Let's say the PR is `update/dataviews-package`.
- Now, go to the console, merge the PR into `trunk` and push.

```sh
git switch trunk
git merge update/dataviews-package
git push
```

This will create a merge commit in `trunk` and push it to the remote repository. GitHub will auto-close the existing Pull Request.

## FAQ

- Keeping your sync branch up to date with wp-calypso
- Why do we need to integrate the upstream changes via "true merge" commit in wp-calypso's trunk?
- Why don't we merge the sync PR via GitHub UI?
- Why do we use `git subtree split` to extract the DataViews package from Gutenberg?

### Keeping your sync branch up to date with wp-calypso

Sometimes you'll need to ensure your sync branch is working on top of the latest changes from Calypso trunk. For example, a Calypso update that affects your branch's CI build. One option is to repeat the update process, that's okay. Alternative, you could rebase the sync branch on top of the latest wp-calypso trunk.

When working from a linear commit history, you can normally rebase using `git rebase trunk`. By default, rebasing will drop merge commits, which are important to preserve as they connect Gutenberg's DataViews with wp-calypso's DataViews histories. When working with a branched history, we need to tell git to preserve and rebase merge commits by using the `--rebase-merges` flag: `git rebase --rebase-merges trunk` ([reference](https://git-scm.com/docs/git-rebase#Documentation/git-rebase.txt---rebase-mergesrebase-cousinsno-rebase-cousins)).

```sh
# Make sure you're working from the sync branch.
git checkout update/dataviews-package

# Fetch latest changes
git fetch origin

# Rebase using --rebase-merges to preserve the merge commits
git rebase --rebase-merges trunk

# Check that it worked — the commit history should be preserved. You should see your branch, including the merge commit on top of the latest Calypso commits
git log --oneline --graph -10

# Push your changes
git push --force-with-lease
```

### Why do we need to integrate the upstream changes via “true merge” commit in wp-calypso’s trunk?

We want the git merge algorithm to automatically solve as many conflicts as possible.

When two branches are merged, git compares the files in those branches. For it to know the sequence of the changes, it needs a third version of the files: an older version that can be traced as a common ancestor of those two branches. This is done via tracking back parent commits. See [git 3-way merge algorithm](https://oandre.gal/git-merge/) for a detailed explanation of this process using a single file as an example.

If git isn’t able to find that common ancestor, merging is like pasting a different version of a file: all differences need to be manually solved or tell git to overwrite everything.

### Why don't we merge the sync PR via GitHub UI?

We need to ensure that the merge commit is preserved, because it connects the two histories together (wp-calypso, and Gutenberg's DataViews). However, in GitHub UI, we've disabled the merging button for wp-calypso to have a linear history, which is easier to navigate and work with.

An alternative to using the CLI could have been the following:

- Temporarily enable the merging button in GitHub UI.
- Merge the PR into `trunk` via the merge button.
- Disable merging again.

This would work as well. However, the [merge button in GitHub UI](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github) disables fast-forwards (it's the equivalent of doing `git merge --no-ff`), creating an extra unnecessary merge commit that makes history more difficult to follow.

### Why do we use `git subtree split` to extract the DataViews package from Gutenberg?

Syncing code from upstream requires extracting a subfolder (packages/dataviews) from within a repository — regularly, not as a one-off. This rewrites history, and the commit IDs will be different than in Gutenberg. That’s expected. **We need a process that generates the same commit IDs every time we extract this folder**, so we can use it as if it was an actual repository with stable history.

By design, this should be a safe operation: git calculates the commit IDs based on the contents of the commit object (tree, parent commit, author, committer, etc.) and it doesn’t use any external data. However, git has not been optimized for rewriting history and so there are caveats to consider.

Alternatives considered:

- `git filter-branch`. The git project no longer recommends using this command. According to them, it’s slow, fragile, can rewrite history in unintended ways, and, most importantly, may work differently in different computers (doesn't guarantee stable commit IDs).

> Someone can have a set of “working and tested filters” which they document or provide to a coworker, who then runs them on a different OS where the same commands are not working/tested (some examples in the git-filter-branch manpage are also affected by this). BSD vs. GNU userland differences can really bite. If lucky, error messages are spewed. But just as likely, the commands either don’t do the filtering requested, or silently corrupt by making some unwanted change. The unwanted change may only affect a few commits, so it’s not necessarily obvious either. (The fact that problems won’t necessarily be obvious means they are likely to go unnoticed until the rewritten history is in use for quite a while, at which point it’s really hard to justify another flag-day for another rewrite.)
>
> — [git filter-branch docs](https://git-scm.com/docs/git-filter-branch#SAFETY)

- `git filter-repo`. This is the alternative to `git filter-branch` endorsed by the git project. It's a separate [python script](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md). It explicitely states that it doesn’t guarantee the same commit IDs either:

> Sometimes two co-workers have a clone of the same repository and they run the same git-filter-repo command, and they expect to get the same new commit IDs. Often they do get the same new commit IDs, but sometimes they don’t.
>
> When people get the same commit IDs, it is only by luck; not by design.
> 
> git-filter-repo is designed as a one-shot history rewriting tool. Once you have filtered one clone of the repository, you should not be using it to filter other clones.
>
> — [git-filter-repo docs](https://github.com/newren/git-filter-repo/blob/main/Documentation/FAQ.md#filtering-two-different-clones-of-the-same-repository-and-getting-the-same-new-commit-ids)

- `git subtree split`. This is a contributed script from the community. It’s bundled by git ([shell script](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.sh)), so it’s available in every modern git version by default. It's slower than the two alternatives before (in the order of handful of minutes) but it guarantees the commit IDs to be stable:

> Repeated splits of exactly the same history are guaranteed to be identical (i.e. to produce the same commit IDs) as long as the settings passed to split (such as –annotate) are the same. Because of this, if you add new commits and then re-split, the new commits will be attached as commits on top of the history you generated last time, so git merge and friends will work as expected.
> 
> – [git subtree docs](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.adoc#commands:~:text=Repeated%20splits%20of,work%20as%20expected.)
