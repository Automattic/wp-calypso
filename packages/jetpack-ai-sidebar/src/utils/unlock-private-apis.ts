/**
 * Provides access to WordPress private APIs via `@wordpress/private-apis`.
 *
 * Private APIs are gated behind an opt-in mechanism that restricts usage to
 * allowlisted WordPress packages. This package uses block-editor private
 * spotlight actions so the editor owns focus-mode lifecycle instead of sidebar
 * components mutating Gutenberg DOM classes directly.
 */
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';

export const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/block-editor'
);
