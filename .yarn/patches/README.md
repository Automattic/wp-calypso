# Yarn Patches

## @wordpress/components 32.1.0 dark Text muted color

Patch: `@wordpress-components-npm-32.1.0-dark-text-colors.patch`

Why: `__experimentalText` is deprecated, but Dashboard still has many direct
usages of `variant="muted"`. In production, the upstream muted variant uses a
fixed gray color instead of a theme-aware token. Dashboard dark mode already
overrides `--wp-components-color-gray-700`, so this patch makes muted Text use
that token without changing every call site while we migrate away from
`__experimentalText`.

What it changes: only the Text `muted` variant, from `COLORS.gray[700]` to
`COLORS.theme.gray[700]`. The patch applies to consumers that resolve
`@wordpress/components` through this Yarn patch; some nested WordPress packages
may still resolve their own unpatched locator.

Remove when: Dashboard has replaced its `__experimentalText` usage with the
`Text` component from `@wordpress/ui`.

Validation: after changing the patch, run `yarn install --immutable
--mode=skip-build` and `yarn test-build-tools dependency-patches`. The
dependency patch test references this patch and confirms the installed
production Text `muted` style resolves to
`var(--wp-components-color-gray-700, #757575)`.
