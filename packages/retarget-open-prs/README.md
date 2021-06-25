# retarget-open-prs

A script utilizing the GitHub API to retarget open PRs in a given repository from one branch to another. This is useful, for example, when changing the default branch of a repository.

## Usage

```
Usage: cli.js

Options:
  --owner, -o     The owner of the repository (either a user or organization).
                                                                 [required]
  --repo, -r      The full name of the repository in which to retarget PRs.
                                                                 [required]
  --from, -f      The original branch name against which to select open PRs
                  that need to be retargeted.                     [required]
  --to, -t        The new branch towards which to retarget PRs open against
                  "from"                                         [required]
  --access-token  A GitHub access token authorized to retarget open PRs in the
                  repository named in "repo"                     [required]
  -h, --help      Show help                                       [boolean]

Examples:
  cli.js --owner=Automattic --repo=wp-calypso --from="main" --to="trunk"
  --access-token="ABCDEFG1234567"
```
