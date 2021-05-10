# Overview

## Table of contents

<!-- TOC -->

- [Overview](#overview)
  - [Table of contents](#table-of-contents)
  - [What is this?](#what-is-this)
  - [Our Goals](#our-goals)
  - [Technology](#technology)
  - [What is tested?](#what-is-tested)

<!-- /TOC -->

## What is this?

End-to-end tests (`e2e` for short) describes the automated functional tests that simulate user interaction with the system under test.

A well-maintained suite of e2e tests, in conjunction with CI (continuous integration) pipelines will ensure that regressions to key user flows are caught as early as possible in the development cycle.

## Our Goals

To accelerate development by being a force for continuous improvement, and help identify, prioritize and mitigate bottlenecks from the system.

<sup>(taken from Quality Squad internal memo)</sup>

## Technology

These e2e tests use the same technology as the `wp-calypso` GitHub repository, notably JavaScript on Node. User interaction is simulated using the [selenium-webdriver](https://www.selenium.dev/projects/) library, althought there is an active project under way to migrate to using Playwright.

## What is tested?

At the high level, each test file (or `spec`) fall under one of the following flows:

| Flow                 | Directory                |
| -------------------- | ------------------------ |
| WordPress.com        | `specs/`                 |
| Gutenberg            | `specs-gutenberg/`       |
| Internationalization | `specs-i18n/`            |
| Jetpack              | `specs-jetpack-calypso/` |
| WooCommerce          | `specs-woocommerce/`     |

Core code for Jetpack, WooCommerce and Gutenberg are hosted in other repositories and they have separate e2e testing infrastructure. Tests here are meant to test interactions between their respective components and Calypso.
