---
name: Gutenberg Plugin Upgrade
about: Installing and activating a new version of the Gutenberg Plugin
title: 'Gutenberg: [v#.#.#] plugin upgrade'
labels: gutenberg-upgrade, [Type] Task
assignees: ''

---

<!--
IMPORTANT: When updating this template, please make sure both copies are kept the same! This ensures our upgrade helper bot is in sync with our manual template.
Github template: https://github.com/Automattic/wp-calypso/blob/trunk/.github/ISSUE_TEMPLATE/gutenberg-plugin-upgrade.md
Gutenberg Upgrade Helper Bot™ template: trunk/bin/gutenberg-plugin-upgrade-tracking-issue-template.md

Thanks for updating Gutenberg! Please be sure to update the title above with the version number you're upgrading. This post will cover all potential RCs and point releases (Example, "Gutenberg: v11.2.x plugin upgrade" would cover everything from 11.2.0-rc.1 to 11.2.1, should those all become available)

- Previous Upgrade issue should be linked using Github issue numbers (for example, #53725)
- Release notes for the version(s) you're implementing should be linked directly to the WordPress/gutenberg repo tag
(for example, linking the text 'v11.0.0-rc.1' to https://github.com/WordPress/gutenberg/releases/tag/v11.0.0-rc.1)
-->

Previous upgrade:  
Release notes:

<!--
As you complete the tasks in this list, please update the relevant lines with diff and other IDs
-->

**Install and activate**

- [ ] Install and activate [v#.#.#]-rc.1 on edge (######-code)
- [ ] Install and activate [v#.#.#] on edge (######-code)
- [ ] Activate [v#.#.#] on production (######-code)
- [ ] Request [v#.#.#] AT upgrade (######-p2)

**Testing**

- [ ] [v#.#.#] Desktop viewport E2E
- [ ] [v#.#.#] Mobile viewport E2E
- [ ] [v#.#.#] WPCOM core (######-code)

**Publish internal announcements**

- [ ] Slack: #wpcom-happy-announce
- [ ] P2: wpcomhappy

**Wrap-up**

- [ ] Clean up unused releases
- [ ] Add log entry to the Gutenberg Upgrade Log (pcoGjb-g-p2)
- [ ] [Open a new issue](https://github.com/Automattic/wp-calypso/issues/new?assignees=&labels=gutenberg-upgrade%2C+%5BType%5D+Task&template=gutenberg-plugin-upgrade.md&title=Gutenberg%3A+%5Bv%23.%23.%23%5D+plugin+upgrade) for the next upgrade, transfer remaining tasks, close this issue.

### Blockers 🤷‍♀️

### Other Issues 🐛

**Issues transferred from previous release(s)**

---

cc @Automattic/gutenberg-upgrades @Automattic/cylon
