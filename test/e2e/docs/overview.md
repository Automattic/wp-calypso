<div style="width: 45%; float:left" align="left"><p></p> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./setup.md">Setup --></a> </div>

<br><br>

# Overview

<!-- TOC -->

- [Overview](#overview)
  - [What is this?](#what-is-this)
  - [Our Goals](#our-goals)
  - [What is tested?](#what-is-tested)

<!-- /TOC -->

## What is this?

End-to-end tests (`e2e` for short) describes the automated functional tests that simulate user interaction with the system under test.

A well-maintained suite of e2e tests, in conjunction with CI (continuous integration) pipelines will ensure that regressions to key user flows are caught as early as possible in the development cycle.

## Our Goals

To accelerate development by being a force for continuous improvement, and help identify, prioritize and mitigate bottlenecks from the system.

<sup>(taken from Quality Squad internal memo)</sup>

## What is tested?

Each test file (referred to as `spec`) should be assigned to at least one group.
This ensures that [jest-runner-groups](https://github.com/eugene-manuilov/jest-runner-groups) is able to locate and run the appropriate set of test specs for the build configuration. **Failure to add a group will result in the spec not running as part of CI.**

The following groups are available as of this time:

| Group             | Remarks                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `calypso-pr`      | Run for every commit to any feature branch in this repository.                           |
| `calypso-release` | Run for every PR merged into `trunk` in this repository.                                 |
| `gutenberg`       | Editor-focused specs run on regular cadence.                                             |
| `coblocks`        | Block-focused specs for our fork of [CoBlocks](https://wordpress.org/plugins/coblocks/). |
| `i18n`            | Specs verifying internationalized strings.                                               |
| `p2`              | Specs for the internal P2 system.                                                        |
| `quarantined`     | Specs that need additional work.                                                         |
| `legal`           | Specs for the marketing and legal team.                                                  |
