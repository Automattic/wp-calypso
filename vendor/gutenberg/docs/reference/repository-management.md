# Repository Management

The goal is for this to be a living document explaining how we collaboratively manage the Gutenberg repository. If you’d like to suggest a change, please open an issue for discussion or submit a pull request to the document.

This document covers:

- [Issues](#issues)
  - [Labels](#labels)
  - [Milestones](#milestones)
  - [Triaging Issues](#triaging-issues)
- [Pull Requests](#pull-requests)
  - [Code Review](#code-review)
  - [Design Review](#design-review)
  - [Merging Pull Requests](#merging-pull-requests)
  - [Closing Pull Requests](#closing-pull-requests)
- [Projects](#projects)

## Issues

A healthy issue backlog is one where issues are relevant and actionable. *Relevant* in the sense that they relate to the project’s current priorities. *Actionable* in the sense that it’s clear what action(s) need to be taken to resolve the issue.

Any issues that are irrelevant or not actionable should be closed, because they get in the way of making progress on the project. Imagine the issue backlog as a desk: the more clutter you have on it, the more difficult it is to use the space to get work done.

### Labels

To better organize the issue backlog, all issues should have [one or more labels](https://github.com/WordPress/gutenberg/labels). Here are some you might commonly see:

- [Accessibility](https://github.com/WordPress/gutenberg/labels/Accessibility) - Changes that impact accessibility and need corresponding review (e.g. markup changes).
- [Needs Design Feedback](https://github.com/WordPress/gutenberg/labels/Needs%20Design%20Feedback) - Changes that modify the design or user experience in some way and need sign-off.
- [[Type] Bug](https://github.com/WordPress/gutenberg/labels/%5BType%5D%20Bug) - An existing feature is broken in some way.
- [[Type] Enhancement](https://github.com/WordPress/gutenberg/labels/%5BType%5D%20Enhancement) - Gutenberg would be better with this improvement added.
- [[Type] Plugin / Extension Conflict](https://github.com/WordPress/gutenberg/labels/%5BType%5D%20Plugin%20%2F%20Extension%20Conflict) - Documentation of a conflict between Gutenberg and a plugin or extension. The plugin author should be informed and provided documentation on how to address.
- [[Status] Needs More Info](https://github.com/WordPress/gutenberg/labels/%5BStatus%5D%20Needs%20More%20Info) - The issue needs more information in order to be actionable and relevant. Typically this requires follow-up from the original reporter.

[Check out the label directory](https://github.com/WordPress/gutenberg/labels) for a listing of all labels.

### Milestones

We put issues into [milestones](https://github.com/wordpress/gutenberg/milestones) to better categorize them. Here are some you might see:

- The next 2 releases we have milestones for (e.g. 2.2, 2.3).
- [Feature Complete](https://github.com/WordPress/gutenberg/milestone/8): This includes big features and is what will be managing the vision of Gutenberg. All of this would be done before even merge proposal is thought about. Examples here include nesting, drag and drop and extensibility API.
- [Merge Proposal: Editor](https://github.com/WordPress/gutenberg/milestone/22): All issues related to merge proposal for the editor.
- [Merge Proposal: Rest API](https://github.com/WordPress/gutenberg/milestone/39): All issues related to merge proposal for the Rest API
- [Merge Proposal: Accessibility](https://github.com/WordPress/gutenberg/milestone/43): All accessibility issues related to merge proposal.
- [Merge Proposal: Media](https://github.com/WordPress/gutenberg/milestone/42): All issues related to merge proposal for the media component.
- [Merge Proposal: Documentation](https://github.com/WordPress/gutenberg/milestone/50): All issues related to documentation for the merge proposal.
- [Merge Proposal: i18n](https://github.com/WordPress/gutenberg/milestone/49): All translation issues for the merge proposal.
- [Merge Proposal: Customization](https://github.com/WordPress/gutenberg/milestone/44): All Customization issues for the merge proposal.
- [Merge Proposal: Plugin](https://github.com/WordPress/gutenberg/milestone/48): All plugin and extensibility issues for the merge proposal.
- [Merge Proposal: Back Compat](https://github.com/WordPress/gutenberg/milestone/47): All back compatibility issues for the merge proposal.
- [Merge Proposal: Themes](https://github.com/WordPress/gutenberg/milestone/48): All theme issues for the merge proposal.
- [Merge Proposal: Core](https://github.com/WordPress/gutenberg/milestone/45): All core issues for the merge proposal that don't fit other merge proposal milestones.
- [Bonus Features](https://github.com/WordPress/gutenberg/milestone/32): Again likely not part of triage and includes nice to haves for the project, if time before merge. A few examples include collaborative editing and footnotes.
- [Future](https://github.com/WordPress/gutenberg/milestone/35): this is something that is confirmed by everyone as a good thing but doesn’t fall into other criteria.

### Triaging Issues

To keep the issue backlog healthy, it needs to be triaged regularly. *Triage* is the practice of reviewing existing issues to make sure they’re relevant, actionable, and have all the information they need.

Anyone can help triage the backlog, although you’ll need contributor permission on the Gutenberg repository to modify an issue’s labels or edit its title.

Here are a couple places you can start:

- [All Gutenberg issues without an assigned label](https://github.com/wordpress/gutenberg/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-asc+no%3Alabel)
- [The least recently updated Gutenberg issues](https://github.com/WordPress/gutenberg/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-asc)

When reviewing the issue backlog, here are some steps you can perform:

- If it’s a bug report, test to confirm the report. If there is not enough information to confirm the report, add the `[Status] Needs More Info` label.
- If the issue is missing labels, add some to better categorize it.
- If the issue is duplicate of another already in the backlog, close the issue by commenting with “Duplicate of #<original-id>”. Add any relevant new details to the existing issue.
- If there was conversation on the issue but no actionable steps identified, follow up with the participants to see what’s actionable.
- If the title doesn’t communicate the issue, edit it for clarity.
- If you feel comfortable triaging the issue further, then you can also:
  - Check that the bug report is valid by debugging it to see if you can track down the technical specifics.
  - Check if the issue is missing some detail and see if you can fill in those details. For instance, if a bug report is missing visual detail, it’s helpful to reproduce the issue locally and upload a GIF.


## Pull Requests

Gutenberg follows a feature branch pull request workflow for all code and documentation changes. At a high-level, the process looks like this:


1. Check out a new feature branch locally.
2. Make your changes, testing thoroughly.
3. Commit your changes when you’re happy with them, and push the branch.
4. Open your pull request.

Along with this process, there are a few important points to mention:

- Non-trivial pull requests should be preceded by a related issue that defines the problem to solve and allows for discussion of the most appropriate solution before actually writing code.
- To make it far easier to merge your code, each pull request should only contain one conceptual change. Keeping contributions atomic keeps the pull request discussion focused on one topic and makes it possible to approve changes on a case-by-case basis.
- Separate pull requests can address different items or todos from their linked issue, there’s no need for a single pull request to cover a single issue if the issue is non-trivial.

### Code Review

Every pull request goes through a manual code review, in addition to automated tests. The objectives for the code review are best thought of as:

- Correct — Does the change do what it’s supposed to?
- Secure — Would a nefarious party find some way to exploit this change?
- Readable — Will your future self be able to understand this change months down the road?
- Elegant — Does the change fit aesthetically within the overall style and architecture?
- Altruistic — How does this change contribute to the greater whole?

*As a reviewer*, your feedback should be focused on the idea, not the person. Seek to understand, be respectful, and focus on constructive dialog.

*As a contributor*, your responsibility is to learn from suggestions and iterate your pull request should it be needed based on feedback. Seek to collaborate and produce the best possible contribution to the greater whole.

### Design Review

If your pull request impacts the design, you can ask for a designer to review. Most pull requests that have an impact on design are reviewed. However, you can request a design review on something by adding the [Needs Design Feedback](https://github.com/WordPress/gutenberg/labels/Needs%20Design%20Feedback) label. As a guide, this could be:

- Something based on a previous design, to check is as that design.
- Anything that changes something visually.
- If you just want design feedback on an idea or exploration.

### Merging Pull Requests

A pull request can generally be merged once it is:

- Deemed a worthwhile change to the codebase.
- In compliance with all relevant code review criteria.
- Covered by sufficient tests, as necessary.
- Vetted against all potential edge cases.
- Reviewed by someone other than the original author.

The final pull request merge decision is made by the **@wordpress/gutenberg-core** team.

Please make sure to assign your merged pull request to its release milestone. Doing so creates the historical legacy of what code landed when, and makes it possible for all project contributors (even non-technical ones) to access this information.

### Closing Pull Requests

Sometimes, a pull request may not be mergeable, no matter how much additional effort is applied to it (e.g. out of scope). In these cases, it’s best to communicate with the contributor graciously while describing why the pull request was closed, this encourages productive future involvement.

Make sure to:

1. Thank the contributor for their time and effort.
2. Fully explain the reasoning behind the decision to close the pull request.
3. Link to as much supporting documentation as possible.

If you’d like a template to follow:

> Thanks ____ for the time you’ve spent on this pull request.
>
> I’m closing this pull request because ____. To clarify further, ____.
>
> For more details, please see ____ and ____.

## Projects

We use [GitHub projects](https://github.com/WordPress/gutenberg/projects) to keep track of details that aren't immediately actionable, but that we want to keep around for future reference.

Some key projects include:

* [Customization](https://github.com/WordPress/gutenberg/projects/13) - Blocks and tasks needed for customization in Gutenberg.
* [Extensibility](https://github.com/WordPress/gutenberg/projects/14) - Comprises the entirety of extensibility APIs. See [Native Gutenberg Extensibility Overview](https://github.com/WordPress/gutenberg/issues/3330) for more details.
* [Third-Party Compatibility](https://github.com/WordPress/gutenberg/projects/15) - Issue that impact Gutenberg's adoption in the real world.
