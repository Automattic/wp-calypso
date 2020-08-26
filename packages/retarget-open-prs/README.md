# retarget-open-prs

A script utilizing the GitHub API to retarget open PRs in a given repository from one branch to another. This is useful, for example, when changing the default branch of a repository from one thing to another.

## Usage

```bash
npx retarget-open-prs --repo=<repository name> --from=<original branch name> --to=<new branch name> --github-api-key=<github API key>
```
