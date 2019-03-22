/**
 * External dependencies
 */
import React from 'react';
import RenderDom from 'react-dom';

/**
 * Internal dependencies
 */
import Button from 'components/button';

/**
 *
 * Style dependencies
 */
import './style.scss';

function LandingPage() {
	return (
		<div>
			<h1 class="heading">Welcome to the landing page</h1>
			<p class="greeting">
				Would you like to proceed? <Button>Yes</Button>
			</p>
		</div>
	);
}

/**
 * Default export. Boots up the landing page.
 */
function boot() {
	RenderDom.render( <LandingPage />, document.getElementById( 'primary' ) );
}

boot();
