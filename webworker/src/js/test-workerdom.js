import { upgradeElement } from '@ampproject/worker-dom/dist/index.mjs'; // TODO: use safe version?

function testWorkerDOM() {
	// let's add a mutation observer for debugging
	var targetNode = document.getElementById('upgrade-me');
	console.warn( 'mounted remote block', upgradeElement, targetNode );
	var config = { attributes: true, childList: true, subtree: true };
	// Callback function to execute when mutations are observed
	var callback = function( mutationsList ) {
		for ( var mutation of mutationsList ) {
			if ( mutation.type == 'childList' ) {
				console.log( 'A child node has been added or removed.' );
			} else if ( mutation.type == 'attributes' ) {
				console.log( 'The ' + mutation.attributeName + ' attribute was modified.' );
			}
		}
	};

	// Create an observer instance linked to the callback function
	var observer = new MutationObserver( callback );

	// Start observing the target node for configured mutations
	observer.observe( targetNode, config );
	console.warn( 'added mutation observer' );

	// kick off webworker
	// upgradeElement( document.getElementById('upgrade-me'), '/webworker/remote-gutenberg.js' );
	upgradeElement(
		targetNode,
		'http://remote.localhost:3000/webworker/js/worker.mjs'
	);
	console.warn( 'upgraded element' );
}

window.addEventListener("load", function(event) {
	console.log("All resources finished loading!");
	testWorkerDOM();
});