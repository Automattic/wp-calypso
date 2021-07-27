/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import { addQueryArgs } from 'calypso/lib/url';
import Circle from './circle';
import Logo from './logo-wide';

/**
 * Style dependencies
 */
import 'calypso/assets/stylesheets/style.scss';
import './style.scss';
import illustrationURL from './illustration.svg';

const SUPPORTED_BROWSERS_LINK = 'https://wordpress.com/support/browser-issues/#supported-browsers';

export default function Browsehappy( { from } ) {
	const continueUrl = addQueryArgs( { bypassTargetRedirection: true }, from );

	return (
		<body className="browsehappy__body">
			<nav className="browsehappy__nav">
				<a href="https://wordpress.com" title="WordPress.com" rel="home">
					<Logo />
				</a>
			</nav>
			<main className="browsehappy__main" role="main">
				<img src={ illustrationURL } alt="" />
				<h1>Unsupported Browser</h1>
				<p>Unfortunately this page cannot be viewed by your browser.</p>
				<Button isPrimary href={ SUPPORTED_BROWSERS_LINK }>
					View supported browsers
				</Button>
				{ from && (
					<p>
						<a className="browsehappy__anyway" href={ continueUrl }>
							Continue loading the page anyway
						</a>
					</p>
				) }
				<Circle color="yellow" position="1" />
				<Circle color="red" position="2" />
				<Circle color="gray" position="3" />
			</main>
		</body>
	);
}
