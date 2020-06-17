/**
 * External dependencies
 */
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

/**
 * Internal dependencies
 */
import './style.scss';

const tour = new Shepherd.Tour( {
	defaultStepOptions: {
		scrollTo: true,
	},
} );

tour.addStep( {
	id: 'highlight-header-inserter',
	text: 'This is the inserter where you can add all sorts of cool things, blocks, patterns, etc.',
	attachTo: {
		element: '.edit-post-header-toolbar__inserter-toggle',
		on: 'bottom',
	},
	buttons: [ { text: 'Next', action: tour.next } ],
} );

tour.addStep( {
	id: 'highlight-inserter',
	text: 'You can also quickly add blocks here',
	attachTo: {
		element: '.block-editor-inserter__toggle',
		on: 'bottom',
	},
	buttons: [ { text: 'Next', action: tour.next } ],
} );

tour.addStep( {
	id: 'say-goodbye',
	text: 'And this concludes the tour, have fun creating!',
	buttons: [ { text: 'Done', action: tour.complete } ],
} );

( window as any ).startTour = () => {
	tour.start();
};
