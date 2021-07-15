#Visual Regression Tests

This directory contains a set of visual regression tests. The tests use [BackstopJS](https://github.com/garris/BackstopJS) to capture images, compare them to a set of reference images, and create a report of the results


##Running Tests
To run the tests, use the command:

`yarn test-visual`

After running the tests, if there is a failure but the snapshot from the test is acceptable, run `yarn test-visual-approve` to promote all the images from the last run to be the new reference images.

If you want to start fresh for all tests, you can run `yarn test-visual-reference` to create all new reference images for all of the tests.


##Adding Tests
The tests use [puppeteer](https://github.com/puppeteer/puppeteer) to open the browser, navigate to the page, and take the snapshots for the tests.

To add new scenarios, add them in `scenarios.js` and then create puppeteer scripts in `./backstop_data/engine_scripts`. 

One thing to note, because of the nature of automated browser testing, it is best to keep the scripts as simple as possible. Don't rely on puppeteer to do a lot of setup steps for you, instead go directly to urls if possible.

