import './style.scss';
document.addEventListener( 'DOMContentLoaded', function () {
	const links = document.querySelectorAll( 'a[data-search-query]' );
	const input = document.getElementById( 'support-search-input' );
	const submitButton = document.querySelector( '.search-submit-button' );

	links.forEach( ( link ) => {
		link.addEventListener( 'click', function ( e ) {
			const query = this.getAttribute( 'data-search-query' );
			if ( ! input || ! query || ! submitButton ) {
				return;
			}

			e.preventDefault();

			input.value = query;
			submitButton.click();

			setTimeout( () => {
				input.value = '';
			}, 100 );
		} );
	} );
} );
