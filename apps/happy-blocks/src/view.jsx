// Placeholder for view only assets
import { render } from '@wordpress/element';
import ViewPricingPlans from './pricing-plans/view';

function renderPricingPlansBlock( el ) {
	const attributes = JSON.parse( el.dataset.attributes ?? '{}' );

	render( <ViewPricingPlans attributes={ attributes } />, el );
}

document.addEventListener( 'DOMContentLoaded', () => {
	document
		.querySelectorAll( '.a8c-happy-tools-pricing-plans-block-placeholder' )
		.forEach( renderPricingPlansBlock );
} );
