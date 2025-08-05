document.addEventListener( 'DOMContentLoaded', () => {
	const dropdown = document.querySelector( '.mobile-nav-dropdown' );
	if ( ! dropdown ) {
		return;
	}

	const trigger = dropdown.querySelector( '.dropdown-trigger' );
	const menu = dropdown.querySelector( '.dropdown-menu' );

	const setOpen = ( open ) => {
		trigger.setAttribute( 'aria-expanded', open );
		menu.classList.toggle( 'show', open );
	};

	trigger.addEventListener( 'click', ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setOpen( trigger.getAttribute( 'aria-expanded' ) !== 'true' );
	} );

	document.addEventListener( 'click', ( e ) => {
		if ( ! e.target.closest( '.mobile-nav-dropdown' ) ) {
			setOpen( false );
		}
	} );

	document.addEventListener( 'keydown', ( e ) => {
		if ( e.key === 'Escape' ) {
			setOpen( false );
		}
	} );
} );
