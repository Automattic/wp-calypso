/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export default function Property( { label, children } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="domain-details-card__property">
			<strong>{ label }:</strong>
			<span>{ children }</span>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
