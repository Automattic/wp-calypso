/**
 * Provides access to WordPress private APIs via `@wordpress/private-apis`.
 *
 * Private APIs are gated behind an opt-in mechanism that restricts usage to
 * allowlisted WordPress packages. This utility opts in once and re-exports
 * the `unlock` helper so that any module in this package can unwrap private
 * selectors and dispatchers (e.g., block-editor zoom controls).
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-private-apis/
 */
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';

export const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/edit-site'
);
