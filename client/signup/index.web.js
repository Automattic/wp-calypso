/** @format */

/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { MomentProvider } from 'components/localized-moment/context';
import controller from './controller';

function renderLayout( context ) {
	ReactDOM.render(
		<Provider store={ context.store }>
			<MomentProvider>
				<div className="layout is-section-signup">
					<div id="content" className="layout__content">
						<div id="primary" className="layout__primary">
							{ context.primary }
						</div>
					</div>
				</div>
			</MomentProvider>
		</Provider>,
		document.getElementById( 'wpcom' )
	);
}

export default function() {
	page(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		controller.saveInitialContext,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		renderLayout
	);
}
