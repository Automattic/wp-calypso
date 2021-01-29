/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default function ExampleDomainBrowser( { className } ) {
	return (
		<div className={ classNames( 'example-domain-browser', className ) }>
			<svg width="295" height="102" viewBox="0 0 295 102" xmlns="http://www.w3.org/2000/svg">
				<title>Example Browser</title>
				<g fill="none" fillRule="evenodd">
					<path fill="#D8D8D8" d="M10 0h285v50H0V10C0 4.477 4.477 0 10 0z" />
					<path fill="#FFF" d="M0 50h295v50H0zM94 9h201v30H94a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4z" />
					<text x="99" y="29">
						<tspan className="example-domain-browser__protocol">https://</tspan>
						<tspan className="example-domain-browser__domain">example.com</tspan>
					</text>
					<rect width="30" height="30" x="10" y="10" fill="#FFF" rx="4" />
					<rect width="30" height="30" x="50" y="10" fill="#FFF" rx="4" />
				</g>
			</svg>
		</div>
	);
}
