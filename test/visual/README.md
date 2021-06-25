#Visual Regression Tests

This directory contains a set of visual regression tests. The tests use BackstopJS to capture images, compare them to a set of reference images, and create a report of the results

To Run the tests:
`yarn test-visual`

After running the tests, if there is a failure but the snapshot from the test is acceptable, run `yarn test-visual-approve` to promote all the images from the last run to be the new reference images.

If you want to start fresh for all tests, you can run `yarn test-visual-reference` to create all new reference images for all of the tests.
