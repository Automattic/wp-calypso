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

At the high level, each test file (or `spec`) fall under one of the following flows:

| Flow                 | Directory                |
| -------------------- | ------------------------ |
| Calypso              | `specs/specs-playwright` |
| Editor               | `specs/specs-wpcom`      |
| Internationalization | `specs/specs-i18n`       |
| Jetpack              | `specs/specs-jetpack`    |

Core code for Jetpack, WooCommerce and Gutenberg are hosted in other repositories and they have separate e2e testing infrastructure. Tests within `test/e2e` are meant to test interactions between their respective components and Calypso/WordPress.com.
