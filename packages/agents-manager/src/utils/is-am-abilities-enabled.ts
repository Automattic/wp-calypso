/**
 * Whether AM decoupled abilities are enabled via `?am-abilities=true`.
 */
export default function isAmAbilitiesEnabled(): boolean {
	return new URLSearchParams( window.location.search ).get( 'am-abilities' ) === 'true';
}
