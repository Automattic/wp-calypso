# Testing Guide

Software testing helps protect code from incoming bugs and improves general quality of the functionalities exposed to the users. When you look at it from the developer's standpoint the first thing that comes to mind is unit testing. However it turns out tests come in many flavors.

For Calypso, we follow the general principles of the [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html). We aim to have tests of varying scope, such as small, low-level unit tests, and larger, high-level end-to-end tests. We also aim to have an inverse relationship between test scope and the number of tests. The larger the testing scope, the fewer tests we should need. For example, we should always have more unit tests for a feature than end-to-end tests.

All of this might feel confusing and overwhelming even for seasoned developers. That's why the short talk [What We Can Learn About Testing From The Wheel](https://www.youtube.com/watch?v=Da9wfQ0frGA) by _Kent C. Dodds_ from _Ignite Fluent 2016_ might help understand differences. The author uses a car metaphor to make it easier to distinguish some of the most popular types of testing.

## Test Categories

- [Overview](./testing-overview.md)
- [Unit Tests](./unit-tests.md)
- [Component Tests](./component-tests.md)
- [Snapshot Tests](./snapshot-testing.md)
- [End-to-end Tests](../../test/e2e/README.md)

