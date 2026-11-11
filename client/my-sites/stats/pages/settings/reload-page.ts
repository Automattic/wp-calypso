/**
 * Reload the page. Kept in its own module so tests can replace it: jsdom cannot reload.
 */
export default function reloadPage() {
	window.location.reload();
}
