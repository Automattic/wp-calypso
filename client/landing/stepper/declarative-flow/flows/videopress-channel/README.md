# VideoPress channel flow

`/setup/videopress-channel` — the signup flow behind the **Create your channel** button on
[videopress.com](https://videopress.com). It turns a visitor into the owner of a _channel_: an
ordinary `*.wordpress.com` site running the `pub/videopress-channel` theme with VideoPress enabled.

This is the WordPress.com half of the "VideoPress.com as a video platform" proof of concept
([VIDP-407](https://linear.app/a8c/issue/VIDP-407)). The PoC deliberately uses regular
`*.wordpress.com` addresses — no separate blog network and no `*.videopress.com` domains.

## Steps

1. **Login / signup** (built-in auth via `stepsWithRequiredLogin`).
2. **`channelSetup`** — name the channel, describe it, optionally add an avatar.
3. **`processing`** — creates the site through `useCreateSite` with
   `site_creation_flow: 'videopress-channel'`, `theme: 'pub/videopress-channel'` and
   `site_intent: 'videopress-channel'`. The wpcom side of that flow removes the sample post, enables
   subscriptions, creates the Home / Videos / Playlists / About pages the theme links to, and adds
   the `videopress-channel` blog sticker.
4. On success the user lands on the channel's VideoPress dashboard
   (`/wp-admin/admin.php?page=jetpack-videopress`), ready to upload a first video. There is no
   Launchpad in the PoC.

## Feature flag

`videopress/channel-flow` — on in development, stage, wpcalypso and horizon; off in production. When
it is off the flow records `calypso_videopress_channel_flow_blocked` and redirects to
`/setup/onboarding`.

## Testing instructions

1. Log out. Go to `/setup/videopress-channel`. You should see the WordPress.com login/signup step.
2. Log in (or sign up). You should see the "Name your channel" step.
3. Enter a name and a description and submit.
4. The processing step creates the site; you are redirected to the new site's VideoPress dashboard.
5. Visit the new site: it runs the channel theme (requires `pub/videopress-channel` to be deployed
   and launched on WordPress.com — until then the site falls back to the default theme).

## Owned by

@videopress-team (@mouraheyde)

## Context

VideoPress KB notes 36–38 (platform research, `*.videopress.com` network research, roadmap) and the
2023 VideoPress TV flow this replaces (removed in #95751 / #95763).
