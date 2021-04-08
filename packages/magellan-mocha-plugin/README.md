# :warning::warning: DEPRECATED :warning::warning:

This project, and it's related TestArmada projects, will no longer be supported. No further work from the owners will be done, and no PRs will be reviewed.

# magellan-mocha-plugin

[![Build Status](https://travis-ci.org/TestArmada/magellan-mocha-plugin.svg?branch=master)](https://travis-ci.org/TestArmada/magellan-mocha-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/TestArmada/magellan-mocha-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/TestArmada/magellan-mocha-plugin)

A magellan plugin that connects [magellan](https://github.com/TestArmada/magellan) and [mocha](https://mochajs.org). 


**=============BREAKING CHANGE NOTICE===============**
 1. v8.0.0 would only be compatible with [Magellan](https://github.com/TestArmada/magellan) v10.0.0 and higher**
 2. Rowdy support is ended in this plugin and removed from v8.0.0. If you are looking for rowdy-mocha solution please refer to [magellan-rowdy-mocha-plugin](https://github.com/TestArmada/magellan-rowdy-mocha-plugin).
 3. `magellan-rowdy-mocha-plugin` is still under development, please stay tuned.
**==================================================**
## Usage

 1. Add following code to your `package.json`. 

    ```
    "testarmada-magellan-mocha-plugin": "^8.0.0"
    ```

 2. Add following code to your `magellan.json` (optional)

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
Documentation in this project is licensed under Creative Commons Attribution 4.0 International License. Full details available at https://creativecommons.org/licenses/by/4.0
