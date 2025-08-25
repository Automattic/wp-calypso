# Overview

<!-- TOC -->

- [Overview](#overview)
  - [What is going on?](#what-is-going-on)
  - [Proof of Concept](#proof-of-concept)

<!-- /TOC -->

## What is going on?

End-to-end tests (often called **e2e tests**) are automated functional tests that simulate real user interactions with a system.

The current WordPress.com e2e tests use **Playwright** (API and headless browser automation) together with **Jest** (test framework).

Since then, **Playwright Test** has been released. It provides several advantages over using Playwright with Jest:

- Full support for the Playwright VS Code extension, making writing, running, and debugging tests easier.
- Unlimited `test` blocks, allowing multiple scenarios under one feature to run in parallel.
- Built-in support for custom Playwright fixtures, simplifying the sharing of helpers and data.

## Proof of Concept

The proof of concept (POC) demonstrates how we can gradually migrate to Playwright Test while reusing existing functionality.

Each spec is converted by:

- Updating feature, test, and step names to follow the new style guide.
- Converting existing helpers and data libraries into Playwright fixtures.
- (Planned) Running the new tests side-by-side with existing tests in TeamCity to compare pass rates and execution times.

## New Style Guide

See the [New Style Guide](./new_style_guide.md) for more information.
