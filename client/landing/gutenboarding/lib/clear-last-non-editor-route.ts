/**
 * Communicates to the editor that the `lastNonEditorRoute` state should be cleared.
 *
 * Calypso keeps track of the last non-editor route so that when the user closes the
 * editor they are returned to where they came from. However Gutenboarding doesn't
 * have access to the Calypso redux store so can't update the last non-editor route.
 * This flag in session storage signals to Calypso that it should clear that state
 * so users will be taken back to the default Calypso location after they've finished
 * creating a new site.
 */
export function clearLastNonEditorRoute() {
	window.sessionStorage.setItem( 'a8c-clearLastNonEditorRoute', '1' );
}
