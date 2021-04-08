# magellan-mocha-plugin

Originally forked from <https://github.com/TestArmada/magellan-mocha-plugin>, commit 717179026651241c99b0a8bf65d85064e062d0de. It also incorporates the changes from the previous fork in <https://github.com/Automattic/magellan-mocha-plugin>, commit d8cf5b4e3db9c78f0f33848d492ab70613e52926

This plugin contains Automattic changes to the original `testarmada-magellan-mocha-plugin` and is released as `@automattic/testarmada-magellan-mocha-plugin`

Following there is the original README file:

--

[![Build Status](https://travis-ci.org/TestArmada/magellan-mocha-plugin.svg?branch=master)](https://travis-ci.org/TestArmada/magellan-mocha-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/TestArmada/magellan-mocha-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/TestArmada/magellan-mocha-plugin)

A magellan plugin that connects [magellan](https://github.com/TestArmada/magellan) and [mocha](https://mochajs.org).

**=============BREAKING CHANGE NOTICE===============**

1.  v8.0.0 would only be compatible with [Magellan](https://github.com/TestArmada/magellan) v10.0.0 and higher\*\*
2.  Rowdy support is ended in this plugin and removed from v8.0.0. If you are looking for rowdy-mocha solution please refer to [magellan-rowdy-mocha-plugin](https://github.com/TestArmada/magellan-rowdy-mocha-plugin).
3.  `magellan-rowdy-mocha-plugin` is still under development, please stay tuned.
    **==================================================**

## Usage

1.  Add following code to your `package.json`.

    ```
    "testarmada-magellan-mocha-plugin": "^8.0.0"
    ```

2.  Add following code to your `magellan.json` (optional)

    ```
    "framework": "testarmada-magellan-mocha-plugin"
    ```

## What does it do

This plugin connects magellan and mocha by

```
1. passing down magellan test filters (by tags, groups and/or tests) to mocha for test case selection.
2. passing down node env/configurations for child process spawn purpose.
```

## License

Documentation in this project is licensed under Creative Commons Attribution 4.0 International License. Full details available at <https://creativecommons.org/licenses/by/4.0>
