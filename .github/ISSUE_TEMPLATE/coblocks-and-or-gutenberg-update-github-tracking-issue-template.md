---
name: 'CoBlocks and or Gutenberg update GitHub Tracking Issue template'
about: 'Template for Gutenberg/Coblocks plugin update process'' GitHub tracking issue,
  more: '
title: Update Gutenberg to v<version> and CoBlocks to v<version>
labels: ''
assignees: ''

---

We have installed Gutenberg `v<version>` and CoBlocks `v<version>` to edge sites for early feedback. 

Feedback and bugs and the final activation of the plugins on wpcom will be tracked here, for anyone interested.

Testing post: p7DVsv-8Oh-p2

### Process

* [ ] Install version 8.3.0-rc.1. (D44703-code)
* [ ] Activate version 8.3.0-rc.1. on edge sites (D44704-code)
* [ ] Install version 8.3.0. (D44796-code)
* [ ] Activate version 8.3.0 on edge sites. (D44797-code)
* [ ] Activate 8.3.0 in production for all sites
     - [ ] Prepare diff (@pingwhoeverisresponsible) (D45045-code)
     - [ ] Commit/Deploy 
* [ ] Atomic (p9o2xV-UC-p2)
* [ ] Announce
     - [ ] public (https://wordpress.com/blog/2020/06/18/block-editor-updates/)
     - [ ] internal (p7DVsv-8Rd-p2)

### Testing

* [ ] Calypso E2E tests #43137
* [ ] Teamcity tests (D44704-code)

### Bugs 🐛

* [ ] E2E: Block inserter menu not opening on openBlockInserterAndSearch(). https://github.com/Automattic/wp-calypso/issues/43179
* (Not necessary for launch) Update default block categories for Automattic blocks. https://github.com/Automattic/wp-calypso/issues/43198
