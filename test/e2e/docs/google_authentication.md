[← Documentation index](./overview.md)

# Google authentication session renewal

The Google authentication test restores a Google session into a fresh browser, then signs in through the production Google button. WordPress.com starts logged out. The test checks the real authorization-code exchange, social login response, Google identity, and My Home.

Google can require human verification before accepting a password. A maintainer completes that verification once in a dedicated Chrome window. Subsequent runs reuse Google cookies stored in the existing encrypted E2E secrets file. The test does not exercise Google's password or CAPTCHA screens.

Session lifetime is not guaranteed. If Google requests verification again, the test fails with renewal guidance. A product login failure still fails the test. QualityOps currently coordinates renewal; TESTOPS-299 tracks the mute and follow-up ownership.

## Renew the session

1. Set up the [E2E environment and secrets key](./test_environment.md#decrypting-the-secrets). Use the dedicated `googleLoginUser` account. Keep `DEBUG` and `PWDEBUG` unset.
2. Open installed Chrome with a fresh temporary profile and an unused loopback debugging port. Do not use your personal Chrome profile. For example, on macOS, after confirming port 9333 is unused:

   ```bash
   lsof -nP -iTCP:9333 -sTCP:LISTEN
   google_session_profile=$(mktemp -d "${TMPDIR:-/tmp}/calypso-google-session.XXXXXX")
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --user-data-dir="$google_session_profile" \
     --remote-debugging-address=127.0.0.1 \
     --remote-debugging-port=9333 \
     --no-first-run --no-default-browser-check \
     https://wordpress.com/log-in &
   google_session_pid=$!
   ```

3. Choose **Continue with Google**, sign in with the E2E Google account, and complete any verification yourself. Finish the WordPress.com consent step and reach My Home. Leave this window open.
4. From the repository root, capture directly from that original window:

   ```bash
   yarn workspace @automattic/calypso-e2e capture-google-session 9333
   ```

   This command preserves the other E2E secrets, adds only Google cookies at `testAccounts.googleLoginUser.googleSessionCookies`, and writes encrypted ciphertext. It does not save WordPress.com cookies or browser local storage. It leaves the source browser open.

5. Validate the restored session in a fresh test browser:

   ```bash
   yarn workspace @automattic/calypso-e2e decrypt-secrets
   yarn workspace @automattic/calypso-e2e build
   CALYPSO_BASE_URL=https://wordpress.com yarn workspace wp-e2e-tests playwright test \
     specs/authentication/authentication__google.spec.ts \
     --project=authentication --reporter=list
   ```

   Keep browser traces, screenshots, video, and debug logging disabled for this credentialed test. Do not upload decrypted secrets or copy cookies into comments, logs, or CI parameters. If restoration fails, retain the original window while investigating; copying its profile to another browser is not a substitute for validation.

6. Open a PR containing the updated encrypted secrets file. Record the validation result without secret values. CI uses the existing decryption key. After validation, close only the Chrome process you started and remove its temporary profile:

   ```bash
   kill "$google_session_pid"
   # After the process exits and its debugging port closes:
   rm -rf -- "$google_session_profile"
   ```

Do not automate CAPTCHA solving or change the account's security settings. Renewal is an explicit human maintenance step, not an automatic retry for application failures.
