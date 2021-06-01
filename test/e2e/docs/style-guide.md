# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
    - [Naming Branches](#naming-branches)
    - [Tags](#tags)
    - [Maximum 1 top-level describe block](#maximum-1-top-level-describe-block)
    - [Viewport size](#viewport-size)

<!-- /TOC -->

## Naming Branches

We follow the Automattic [branch naming scheme](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/git-workflow.md#branch-naming-scheme).

## Tags

Tags are labels used by `mocha` and `magellan` to determine what tests should be run and how it can be parallelized. Consider it a form of metadata that conveys various test parameters to the runner.

An example:

```(javascript)
describe( "Block Under Test @parallel", function() {
  describe( "Test case 1", function() {
    it( 'Test step 1', function() {
      ...
    } )
    it( 'Test step 2', function() {
      ...
    } )
  } )
  describe( "Test case 2", function() {
    ...
  } )
} )
```

In the example above, the top-level suite (`Block Under Test`) will be run in parallel with other test suites, while the second-level suites (`Test case 1` and `Test case 2`) will be run in sequential order.

Consider another example:

```(javascript)
describe( "Block Under Test", function() {
  describe( "Test case 1 @parallel", function() {
    it( 'Test step 1', function() {
      ...
    } )
    it( 'Test step 2', function() {
      ...
    } )
  } )
  describe( "Test case 2 @parallel", function() {
    ...
  } )
} )
```

In the example above, note the `@parallel` tag has shifted to be inside the second-level suites. 

When executed with `mocha` + `magellan`, this would result in `Test case 1` and `Test case 2` being run in parallel.

Some currently supported tags:
- parallel
- jetpack
- signup

> :warning: Test suites not tagged with the `@parallel` tag will not be recognized by `magellan` as a valid test suite and thus will not be run in CI.

## Maximum 1 top-level describe block

Each test file should only contain at most 1 top-level `describe` block.

There is no restriction on the number `describe` blocks that are not top-level, nor a restriction on the depth of `describe` blocks.

## Viewport size

All tests should be written to work in three modes: desktop (1440 wide), tablet (1024 wide) and mobile (375 wide).

Tests can be run in different modes by setting an environment variable `BROWSERSIZE` to either `desktop`, `tablet` or `mobile`. See [this section](running-tests.md#execution-parameters#headful) for more information.


