/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	document.addEventListener(
		'click',
		function ( event ) {
			if (
				event?.target?.classList.contains( 'edit-post-header-toolbar__inserter-toggle' ) ||
				event?.target?.parentNode.classList.contains( 'edit-post-header-toolbar__inserter-toggle' )
			) {
				let attempts = 0;
				const panelInception = setInterval( () => {
					const tabsContainer = document.getElementsByClassName( 'components-tab-panel__tabs' );
					if (
						! tabsContainer ||
						! tabsContainer[ 0 ] ||
						! tabsContainer[ 0 ].childNodes?.length === 0
					) {
						attempts++;
						if ( attempts > 10 ) {
							clearInterval( panelInception );
						}
						return;
					}

					clearInterval( panelInception );
					const patterns = tabsContainer[ 0 ].querySelectorAll( '[id$=patterns]' );
					const blocks = tabsContainer[ 0 ].querySelectorAll( '[id$=blocks]' );
					const reusable = tabsContainer[ 0 ].querySelectorAll( '[id$=reusable]' );
					if ( patterns && blocks && reusable ) {
						patterns[ 0 ].click();
						tabsContainer[ 0 ].replaceChildren( ...patterns, ...blocks, ...reusable );
					}
				}, 100 );
			}
		},
		false
	);
} );
