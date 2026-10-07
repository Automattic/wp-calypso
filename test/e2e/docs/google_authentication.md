[← Documentation index](./overview.md)

# Google authentication session renewal

The Google authentication test restores a Google session into a fresh browser, then signs in through the production Google button. WordPress.com starts logged out. The test checks the real authorization-code exchange, social login response, Google identity, and My Home.

Google can require human verification before accepting a password. A maintainer completes that verification once in a browser started by the capture script. Subsequent runs reuse Google cookies stored in the existing encrypted E2E secrets file. The test does not exercise Google's password or CAPTCHA screens.

Session lifetime is not guaranteed. If Google requests verification again, the test fails with renewal guidance. A product login failure still fails the test. QualityOps currently coordinates renewal; TESTOPS-299 tracks the mute and follow-up ownership.

## Why the capture disables session binding

The capture script starts installed Google Chrome with a fresh temporary profile, as a plain process without automation flags. Google refuses sign-in from Playwright's bundled Chrome for Testing and from any Chrome started with a DevTools port ("This browser or app may not be secure"), so you sign in with no port open. Once you quit Chrome, the script reopens the same profile headless with a DevTools port and no page loaded, and reads the cookies from it. Quit Chrome normally: only a graceful quit reliably writes the cookies to the profile. The script also disables `DeviceBoundSessions` and `EnableBoundSessionCredentials`: Chrome's [Device Bound Session Credentials](https://w3c.github.io/webappsec-dbsc/) and its Google-account variant bind Google sessions to the capturing machine's key store, and a bound session expires soon after it moves to CI. Chrome enables them by default on some platforms or through server-side field trials; command-line overrides take precedence over both, so the capture does not depend on the machine's trial group. To confirm the flags were applied, check **Command Line** in `chrome://version` in the sign-in window.

## Renew the session

1. Set up the [E2E environment and secrets key](./test_environment.md#decrypting-the-secrets). Use the dedicated `googleLoginUser` account. Keep `DEBUG` and `PWDEBUG` unset. The script uses installed Google Chrome; set `GOOGLE_CHROME_PATH` if it isn't in the default location. On a managed machine, Chrome policy can disable remote debugging (`RemoteDebuggingAllowed` in `chrome://policy`); the capture can't run there.
2. Note the current ciphertext hash for the PR description:

   ```bash
   shasum -a 256 packages/calypso-e2e/src/secrets/encrypted.enc
   ```

3. From the repository root, start the capture:

   ```bash
   yarn workspace @automattic/calypso-e2e capture-google-session
   ```

   The script opens Chrome with a fresh temporary profile at the WordPress.com login page. Choose **Continue with Google**, sign in with the E2E Google account and complete any verification yourself. Decline Chrome's own "Sign in to Chrome" or sync prompt: stay signed in on the web only, otherwise Chrome adds a separate browser session. Finish the WordPress.com consent step and reach My Home, then quit Chrome (Cmd+Q on macOS, where closing the window isn't enough).

   The script then reads the cookies from the profile, preserves the other E2E secrets, adds only Google cookies at `testAccounts.googleLoginUser.googleSessionCookies` and writes encrypted ciphertext. It does not save WordPress.com cookies or browser local storage. It keeps the profile and waits.

   While the script reads the cookies, the headless browser's DevTools port accepts connections from any local process, and those can read every cookie. Do this on a single-user machine.

4. Validate the restored session in a fresh test browser, from another terminal:

   ```bash
   yarn workspace @automattic/calypso-e2e decrypt-secrets
   yarn workspace @automattic/calypso-e2e build
   CALYPSO_BASE_URL=https://wordpress.com yarn workspace wp-e2e-tests playwright test \
     specs/authentication/authentication__google.spec.ts \
     --project=authentication --reporter=list
   ```

   From the EU this local run can't pass: the test fixture sets a `sensitive_pixel_options` consent cookie, and with it WordPress.com doesn't load Google sign-in, so the popup never opens and the test fails at "Google account selection or consent". Validate on CI instead, with a TeamCity personal build that applies only the new `encrypted.enc` to your current commit. Run it from a branch whose HEAD is already pushed (for example your renewal branch before you commit the secrets), so CI builds exactly the code the patch was made against; nothing is pushed:

   ```bash
   # HEAD + path: include a staged encrypted.enc and nothing else; --binary keeps it intact.
   git diff --binary HEAD -- packages/calypso-e2e/src/secrets/encrypted.enc > "${TMPDIR:-/tmp}/google-session.patch"
   # --local-changes needs the `=` form for a path.
   teamcity run start calypso_calypso_WebApp_Calypso_E2E_Authentication \
     --personal --no-push --branch @this --revision @head \
     --local-changes="${TMPDIR:-/tmp}/google-session.patch" \
     -m "Validate renewed Google session"
   ```

   Check that the Google test passed in that build, not just the build status.

   Keep browser traces, screenshots, video and debug logging disabled for this credentialed test. The test scrubs its own failure message, but Playwright's HTML and CTRF reports still record the raw error of every browser step: a failure in the Google popup can leave the account email and fragments of Google's page in `test/e2e/output`. Treat that folder, locally and as a CI artifact, as sensitive. Do not upload decrypted secrets or copy cookies into comments, logs or CI parameters. If restoration fails, press Ctrl+C in the capture terminal (step 5); copying the profile to another browser is not a substitute for validation.

5. If validation passes, press Enter in the capture terminal. Chrome reopens on [Google Account device activity](https://myaccount.google.com/device-activity) in the captured session: sign out every session except "Your current session", then quit Chrome. The script deletes the profile when Chrome exits. Earlier snapshots stay decryptable in git history; signing them out is what makes them useless.

   If validation fails, press Ctrl+C instead, restore the previous file with `git restore --source=HEAD --staged --worktree packages/calypso-e2e/src/secrets/encrypted.enc` (this also works if you already staged it), then do step 7.

6. Repeat the step 4 validation: the local test, or from the EU the TeamCity personal build (the revocation window doesn't rewrite `encrypted.enc`, so the same patch still applies). The revocation window loads Google pages in the captured session, which can rotate its cookies; this second run confirms the stored copy still works. If it fails, capture again.
7. In every outcome, delete the decrypted secrets, the patch and the test output: `rm -f packages/calypso-e2e/src/secrets/decrypted-secrets.json packages/calypso-e2e/dist/{cjs,esm}/src/secrets/decrypted-secrets.json "${TMPDIR:-/tmp}/google-session.patch" && rm -rf test/e2e/output`. The package build copies the decrypted file into `dist/`, so the source file isn't the only plaintext copy.
8. Open a PR containing the updated encrypted secrets file. Record the validation result and the old and new `shasum -a 256` of `encrypted.enc` without secret values, so reviewers can tell a renewal from a rollback to an older file. CI uses the existing decryption key.

Do not automate CAPTCHA solving or change the account's security settings. Renewal is an explicit human maintenance step, not an automatic retry for application failures.
