Contributing to Calypso
=======================

Calypso is Open Source software licensed under [GNU General Public License v2 (or later)](./LICENSE.md).

--------

We want to help you start off on the right foot when working with Calypso, reading this is a great first step.

**The most important things to know when starting out are:**

1. All code written for Calypso goes through a peer code review process before it is merged to master.
2. The workflows for Calypso are different than what you're used to at Automattic, it will take time to adjust.
3. We are all in this together, building a great WordPress powered experience. We're here to help you along the way.
4. Good judgement trumps all.

If you can keep those in mind during your first couple of months working with Calypso, you're going to do great. Don't stop reading here though, there's some more important details for each of the above points.

The peer code review process
----------------------------

Code reviews are an important part of the Calypso workflow. They help to keep code quality consistent, and they help every person working on Calypso improve over time. We want to make you the best Calypso contributor you can be.

Every PR should be reviewed and approved by someone other than the author. Fresh eyes can find problems that can hide in the open if you've been working on the code for a while.

This is one of the primary reasons PRs should be kept small and pushed often (more about that below). We can help you with decisions, make suggestions, and help guide your feature *as you're building it.*

*Everyone* is encouraged to review PRs and add feedback and ask questions, even people who are new to calypso. Also, don't just review PRs from your own team. Reading other people's code is a great way to learn new techniques, and seeing code outside of your own feature helps you to see patterns across the project. It's also helpful to see the feedback other contributors are getting on their PRs. 

The final thumbs-up and **<span class="label status-ready-to-merge">[Status] Ready to Merge</span>** should come from a Calypso contributor that has authored and reviewed a number of merged PRs if the change is substantial.

[A positive mindset towards code reviews](https://medium.com/medium-eng/the-code-review-mindset-3280a4af0a89) is really important. We're building something together that is greater than the sum of its parts, everyone should feel ownership of code going into Calypso and want to make it the best it can be.

If you feel yourself waiting for someone to review a PR, don't hesitate to ask for someone to review on Slack or to ping someone directly via a Github mention. _The PR author is responsible for pushing the change through._

The Calypso Workflow
--------------------

When you're first starting out, your natural instinct when creating a new feature will be to create a local feature branch, and start building away. If you start doing this, *stop*, take your hands off the keyboard, grab a coffee and read on. :)

**It's important to break your feature down into small pieces first**, each piece should become its own pull request. Even if after finishing the first piece your feature isn't functional, that is okay, we love merging unfinished code early and often. You can place your feature behind a [feature-check](config/README.md#feature-flags) to make sure it's not exposed until all pieces are completed. It's also a good idea to read up on [the CSS/SASS coding guidelines](docs/coding-guidelines/css.md), to ensure form and syntax is consistent.

Once you know what the first small piece of your feature will be, follow this general process while working:

1. Create a new branch, use the [proper naming](docs/git-workflow.md#branch-naming-scheme), _e.g._ `add/video-preview` or `fix/1337-language-too-geeky`
2. Make your first commit: any will do even if empty or trivial, but we need something in order to create the initial pull request. Create the pull request and prefix the name with the section of the product, _e.g._ _Posts: Prepare store for desktop app_.
  - Write a detailed description of the problem you are solving, the part of Calypso it affects, and how you plan on going about solving it.
  - Add the **<span class="label status-in-progress">[Status] In Progress</span>** label. This indicates that the pull request isn't ready for final review and may still be incomplete. On the other hand, it welcomes early feedback and encourages collaboration during the development process.
3. Start developing and pushing out commits to your new branch.
  - Push your changes out frequently and try to avoid getting yourself stuck in a long-running branch or a merge nightmare. When your local work diverges enough from the master branch it can be hard to review and hard to reconcile conflicts.
  - Follow the [merge checklist](docs/merge-checklist.md) before pushing. This ensures that your code follows the style guidelines and doesn't accidentally introduce any errors or regressions.
  - Note that you can automate some of these tasks by setting up [githooks](docs/coding-guidelines/javascript.md#setting-up-githooks) and they will run whenever you `git commit`.
  - Don’t be afraid to change, [squash](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html), and rearrange commits or to force push - `git push -f origin fix/something-broken`. Keep in mind, however, that if other people are working on the same branch then you can mess up their history. You are perfectly safe if you are the only one pushing commits to that branch.
  - Do proactively squash minor commits such as typo fixes or [fixes to previous commits](http://fle.github.io/git-tip-keep-your-branch-clean-with-fixup-and-autosquash.html) in the pull request.
4. If you end up needing more than a few commits, consider splitting the pull request into separate components. Discuss in the new pull request and in the comments why the branch was broken apart and any changes that may have taken place that necessitated the split. Our goal is to catch early in the review process those pull requests that attempt to do too much.
5. When you feel that you are ready for a formal review or for merging into `master` make sure you check this list and our [merge checklist](docs/merge-checklist.md).
  - Make sure your branch merges cleanly and consider rebasing against `master` to keep the branch history short and clean.
  - If there are visual changes, add before and after screenshots in the pull request comments.
  - Add unit tests, or at a minimum, provide helpful instructions for the reviewer so he or she can test your changes. This will help speed up the review process.
  - Ensure that your commit messages are [meaningful](http://robots.thoughtbot.com/5-useful-tips-for-a-better-commit-message).
6. Remove the **<span class="label status-in-progress">[Status] In Progress</span>** label from the pull request and add the **<span class="label status-needs-review">[Status] Needs Review</span>** label - someone will provide feedback on the latest unreviewed changes. The reviewer will also mark the pull request as **<span class="label status-awaiting-fixes">[Status] Awaiting Fixes</span>** if he or she thinks changes are needed.
7. If you get a <img src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png" class="emoji" />, <img src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f4a5.png" class="emoji" />, <img src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f6a2.png" class="emoji" />, <img src="https://assets-cdn.github.com/images/icons/emoji/shipit.png" class="emoji" />, or a LGTM and the status has been changed to **<span class="label status-ready-to-merge">[Status] Ready to Merge</span>**, merge the changes into `master`.

> Reviewing can be a time-consuming process if only handled by a few developers. Why not skim the list of open pull requests while waiting and review someone else's work in the meantime? Everyone is welcome to add comments at any level, from basic programming style to advanced Calypso ways and means. You may not feel comfortable signing off on someone else's work, but they reviewing you are more-fully joining the project and helping to share the load. **We're all in this together**.


We're here to help along the way
--------------------------------

Don't be afraid to ask for help at any point. We want your first experience with Calypso to be a good one, so don't be shy. If you're wondering why something is the way it is, or how a decision was made, you can tag issues with **<span class="label type-question">[Type] Question</span>**.
