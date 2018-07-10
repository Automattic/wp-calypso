# Releasing Gutenberg

This document is a checklist for building and releasing a new version of Gutenberg. Unless you have commit access to the WordPress.org plugin repository, it's unlikely to be of much use to you. 🙂

## Writing the Release Post and Changelog

* Open the [recently updated PRs view](https://github.com/WordPress/gutenberg/pulls?q=is%3Apr+is%3Aclosed+sort%3Aupdated-desc) and find the PR where the last version bump occurred.
* Read through each PR since the last version bump to determine if it needs to be included in the Release Post and/or changelog.
* Choose a feature or two to highlight in the release post–record an animation of them in action.
* Save the draft post on [make.wordpress.org/core](https://make.wordpress.org/core/), for publishing after the release.

## Bumping the Version

* Create a PR like [this one](https://github.com/WordPress/gutenberg/pull/3479/files), bumping the version number in `gutenberg.php`, `package.json`, and `package-lock.json`.
* Check that there's no work-in-progress that's just about to land. [Inform committers in `#core-editor` on Slack](https://make.wordpress.org/chat/) to hold off on merging any changes until after the release process is complete.
* Merge the version bump PR.

### For Patch Releases Done via `git cherry-pick`

If you're creating a bugfix release which is cherry-picked instead of tagged from `master` (example: https://github.com/WordPress/gutenberg/compare/v3.1.0…v3.1.1), you should go about things a bit differently:

1. Check out the last release (for example: `git checkout v3.1.0`).
2. Cherry-pick commits (in chronological order) with `git cherry-pick [SHA]`.
3. Tag this release and push it to GitHub:
```bash
git tag v3.1.1
git push origin v3.1.1
```
4. Create a merge PR against master that only bumps the version number in `gutenberg.php`, `package.json`, and `package-lock.json`.

## Build the Release

Note: The `1.x.0` notation `git` and `svn` commands should be replaced with the version number of the new release.

* Run `git checkout master` and `git pull`. Make sure your local `master` is up to date; you can confirm this by opening `gutenberg.php` and checking for the version bump you merged previously.
* Run `./bin/build-plugin-zip.sh` from the root of project. This packages a zip file with a release build of `gutenberg.zip`.
* Check that the zip file looks good. Drop it in the [`#core-editor` channel](https://wordpress.slack.com/messages/C02QB2JS7) for people to test. Again: make sure if you unzip the file that the version number is correct.
* Run `git tag v1.x.0` from `master` branch (with the new version we are shipping).
* Run `git push --tags`.

## Push the Release

You'll need to use Subversion to publish the plugin to WordPress.org.

* Do an SVN checkout of `https://wordpress.org/plugins/gutenberg/`:
  * If this is your first checkout, run: `svn checkout https://plugins.svn.wordpress.org/gutenberg`
  * If you already have a copy, run: `svn up`
* Delete the contents of `trunk` except for the `readme.txt` and `changelog.txt` files (these files don’t exist in the git repo, only in subversion).
* Extract the contents of the zip file to `trunk`.
* Edit `readme.txt`, replacing the changelog for the previous version with the current release's changelog.
* Add the changelog for the current release to `changelog.txt`.
* Add new files to the SVN repo, and remove old files, in the `trunk` directory:
```bash
# Add new files:
svn st | grep '^\?' | awk '{print $2}' | xargs svn add
# Delete old files:
svn st | grep '^!' | awk '{print $2}' | xargs svn rm
```

* Commit the new version to `trunk`:
```bash
svn ci -m "Committing version 1.x.0"
```

* Tag the new version. Change to the parent directory, and run:
```bash
svn cp trunk tags/1.x.0
svn ci -m "Tagging version 1.x.0."
```

* Edit `trunk/readme.txt` to point to the new tag. The **Stable version** header in `readme.txt` should be updated to match the new release version number. After updating and committing that, the new version will be released:
```bash
svn ci -m "Releasing version 1.x.0"
```

## Post-Release

* Check that folks are able to install the new version from their Dashboard.
* Publish the make/core post.
* Pat yourself on the back! 👍

Ta-da! 🎉
