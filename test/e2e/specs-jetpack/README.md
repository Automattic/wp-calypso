# Jetpack smoke test against multiple test accounts

`runner.sh` is a bare-bones script to launch a `connect-disconnect-spec.js` multiple times against different test hosts.
This test runner & test is created to run Jetpack beta releases to make sure release does not include any fatal errors in connection flow & frontend.

List of included hosts:

- [ASO] Running PHP 5.2
- [GoDaddy 1] Running PHP 5.6.36
- [GoDaddy 2] Running PHP 5.6.36, WP in a subdirectory
- [BlueHost 1] Running PHP 7.0.25, WP 5.0-alpha
- [BlueHost 2] Running PHP 7.0.25, WP in a subdirectory
- [SiteGround] Running PHP 7.1.18, single install

To run them locally:

- make sure you have decrypted config and dependencies installed e.g. you can run tests locally
- run `sh specs-jetpack/runner.sh`

It also possible to run these tests in CI. Visit <https://circleci.com/gh/Automattic/wp-e2e-tests-jetpack-smoke/> and re-launch latest CI build.

Wrapper repo: <https://github.com/Automattic/wp-e2e-tests-jetpack-smoke>
Internal ref: p9dueE-lw-p2
