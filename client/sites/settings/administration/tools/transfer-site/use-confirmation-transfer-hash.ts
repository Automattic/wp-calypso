/**
 *
 * @returns The confirmation hash from the URL, or null if it doesn't exist.
 */
export function useConfirmationTransferHash() {
	const newUrl = new URL( window.location.href );
	const hash = newUrl.searchParams.get( 'site-transfer-confirm' );
	return hash;
}
