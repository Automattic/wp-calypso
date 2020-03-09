# Calypso RFCs

Most changes can and should be implemented and reviewed via the normal GitHub pull request workflow.

However, there are substantial changes that may require big refactors or impacdt the workflow of many developers. In that case, we ask that those
changes to be put through a bit of a design process and produce a consensus among Team Calypso and Calypso contributors.

## When to follow this process

You should consider using this process if:

- The change is a major refactor that will likely span across multiple teams
- It will likely impact the existing workflow of many Calypso contributors
- Is a change to the framework
- Introduces a significant change to the tech stack

This process is not recommended if:

- The change affects mostly end users, without noticeable impact outside the team implementing it.

## The process

(Loosely based on https://github.com/yarnpkg/rfcs)

1. Create a new Markdown file with a name like `01-rfc-short-description.md`
2. The document should cover the following topics:

   - Champion: who is the "lead" of this RFC. The champion will see that the RFC follows the process until it lands.
   - Summary: describe what the RFC does, focus on the problems it solves or the benefits it provides.
   - Design/roadmap: for complex RFCs, describe what the final state will be, and potential stages required to reach that state.
   - Communications: if it has an impact on other Calypso teams, describe the communication strategy (blogposts, deprecation notes, dates, etc).
   - Drawnbacks: detail the drawnbacks and tradeoffs we'll have to make if we accept this RFC.
   - Unresolved/future questions: not all RFCs have to be defined perfectly, it is ok to leave some open questions, specially on big RFCs.

3. Raise a PR and ping relevant teams to review it.
4. Activelly address the feedback, incorporate it to the RFC when necessary and seek for a consesus.
5. Merge the PR

## Accepted RFCs

When a RFC is merged it doesn't mean that it is activelly being worked on or that is part of any team's roadmap. Merging a RFC is a way to signal
"we as a group think this change is good and we'll be amenable to review+merge any PR that implements it".
