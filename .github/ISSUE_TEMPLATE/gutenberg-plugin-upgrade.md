---
name: Gutenberg Plugin Upgrade
about: Installing and activating a new version of the Gutenberg Plugin
title: 'Gutenberg: [v#.#.#] plugin upgrade'
labels: gutenberg-upgrade, [Type] Task
assignees: ''

---

<!--
Thanks for updating Gutenberg! Please be sure to update the title above with the version number you're upgrading.
If you're updating multiple versions (for example, 11.0.0 to production and 11.0.1 to edge), please indicate with an 'x' where appropriate (for example, v11.0.x)

- Previous Upgrade issue should be linked using Github issue numbers (for example, #53725)
- Release notes for the version(s) you're implementing should be linked directly to the WordPress/gutenberg repo tag
(for example, linking the text 'v11.0.0-rc.1' to https://github.com/WordPress/gutenberg/releases/tag/v11.0.0-rc.1)
-->
Previous upgrade:  
Release notes:

<!--
As you complete the tasks in this list, please update the relevant lines with diff and other IDs
-->
- [ ] Install and activate
   - [ ] Copy & install [version #] (######-code, ######-code)
   - [ ] Activate [version #] on edge (######-code)
   - [ ] Copy & install [version #] (######-code, ######-code)
   - [ ] Activate [version #] on edge (######-code)
   - [ ] Activate [version #] on production (######-code)
   - [ ] Request AT upgrade (######-p2)
 - [ ] Testing
   - [ ] Desktop viewport E2E
   - [ ] Mobile viewport E2E
   - [ ] WPCOM (######-code)
 - [ ] Publish internal announcements
    - [ ] Slack: #team-calypso
    - [ ] Slack: #wpcom-happy-announce
    - [ ] P2: wpcomhappy
 - [ ] Clean up unused releases
 - [ ] Add log entry to the Gutenberg Upgrade Log (######-p2)
 - [ ] [Open a new issue](https://github.com/Automattic/wp-calypso/issues/new?assignees=&labels=gutenberg-upgrade%2C+%5BType%5D+Task&template=gutenberg-plugin-upgrade.md&title=Gutenberg%3A+%5Bv%23.%23.%23%5D+plugin+upgrade) for the next upgrade, transfer remaining tasks, close this issue.

 ### Blockers 🤷‍♀️

 ### Other Issues 🐛

 **Issues transferred from previous release(s)**

 ---
 cc @inaikem @simison
