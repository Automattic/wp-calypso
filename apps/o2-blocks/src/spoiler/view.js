class SpoilerCloseButton extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow( { mode: 'open' } );
		shadowRoot.innerHTML = `
			<style>
			div {
				background-color: blue;
				border-radius: 2px;
				color: white;
			}

			div:hover {
				background-color: darkblue;
				color: lightblue;
			}
			</style>

			<div role="button" tabindex="0">Close</div>
		`;

		shadowRoot.querySelector( 'a' ).addEventListener( 'click', ( event ) => {
			event.preventDefault();
			this.parentNode.removeAttribute( 'open' );
		} );
	}
}

window.customElements.define( 'spoiler-closer-button', SpoilerCloseButton );

const addCloseButtons = () => {
	const spoilers = document.querySelectorAll( 'details.wp-block-a8c-spoiler' );

	for ( const spoiler of spoilers ) {
		if ( spoiler.lastChild ) {
			spoiler.lastChild.after( document.createElement( 'spoiler-closer-button' ) );
		}
	}
};

document.addEventListener( 'DOMContentLoaded', addCloseButtons );
