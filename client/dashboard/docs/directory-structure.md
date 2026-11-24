# Directory Structure

## Top Level

- `app/`: the shell
- `app-dotcom/`, `app-a4a/`: app config and routes
- `sites/`, `domains/`, `emails/`, `account/`, `plugins/`, `agency/`, `agency-client/`: feature areas
- `components/`, `hooks/`, `utils/`, `types/`, `images/`: shared code
- `docs/`, `eslint-rules/`: documentation and lint rules

Several directories predate this structure and haven't been moved into it yet.

## App shell

`app/` holds what every page needs and no single feature owns: routing, layout, auth, analytics, snackbars, the omnibar, the sidebars and similar services. It sits outside the feature areas so that all of them can use it without depending on each other.

## App config and routes

`app-dotcom/` and `app-a4a/` hold each app's config and the parts of the shell that differ between apps, such as A4A's omnibar and help center, so shared code can read a config property instead of checking which app it's in. Routes still live in `app/router/`, and screens in the feature areas. `app-dotcom/routes/` is an experimental prototype of moving each app's routes and screens into folders that follow the URL. Don't add to it unless the task is about that layout.

## Feature areas

A feature area groups code by what it's about. Inside an area, group code into sub-features named for a concept, not for a URL or a menu. Keep it to two levels, area then sub-feature, each with only the `components/`, `hooks/` or `utils` it needs, so paths stay short and predictable. Put code at the narrowest scope that uses it (one sub-feature, then the area, then the shared top-level folders) and in the area that owns its data rather than the one whose page shows it. Imports go one way, from apps to areas to shared code, so areas don't end up depending on each other in circles.
