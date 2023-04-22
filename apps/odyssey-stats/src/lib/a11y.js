// Description: This file contains all the a11y related functions.

// removes the role="main" attribute from all elements that are not the main element
export function removeMainRoleFromExistingElements() {
	const elementsToRemoveRole = document.querySelectorAll( '[role=main]:not(main)' );

	elementsToRemoveRole.forEach( ( element ) => {
		element.removeAttribute( 'role' );
	} );
}
