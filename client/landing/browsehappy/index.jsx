import { __ } from '@wordpress/i18n';
import React from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import Circle from './circle';
import illustrationURL from './illustration.svg';
import Logo from './logo-wide';
import 'calypso/assets/stylesheets/style.scss';
import './style.scss';

const SUPPORTED_BROWSERS_LINK = 'https://wordpress.com/support/browser-issues/#supported-browsers';

export default function Browsehappy( { from, wpcomRootUrl } ) {
	// Both from and wpcomRootUrl are passed into the component by SSR. `from`
	// comes from the `from` query param, but `wpcomRootUrl` is generated on the
	// server. As a result, we can ensure that we only redirect to "from" if "from"
	// starts with the wpcom root URL for this calypso environment. This prevents
	// us from redirecting to arbitrary domains.
	const isValidUrl = new RegExp( '^' + wpcomRootUrl ).test( from );
	const continueUrl = addQueryArgs( { bypassTargetRedirection: true }, isValidUrl ? from : '/' );

	return (
		<body className="browsehappy__body">
			<nav className="browsehappy__nav">
				<a href="https://wordpress.com" title={ __( 'WordPress.com' ) } rel="home">
					<Logo />
				</a>
			</nav>
			<main className="browsehappy__main" role="main">
				<img src={ illustrationURL } alt="" />
				<h1>{ __( 'Unsupported Browser' ) }</h1>
				<p>{ __( 'Unfortunately this page may not work correctly in your browser.' ) }</p>
				{ /* TODO: This mimics @wordpress/components button. Currently, wp components
				does not compile in the server build because it is missing a peer dependency.
				That problem will be resolved once the latest version of @wordpress/components
				available in Calypso. We should switch to the Button component at that time. */ }
				<a class="components-button is-primary" href={ SUPPORTED_BROWSERS_LINK }>
					{ __( 'View supported browsers' ) }
				</a>
				<p>
					<a className="browsehappy__anyway" href={ continueUrl }>
						{ __( 'Continue loading the page anyway' ) }
					</a>
				</p>
				<Circle color="yellow" position="1" />
				<Circle color="red" position="2" />
				<Circle color="gray" position="3" />
			</main>
		</body>
	);
}
