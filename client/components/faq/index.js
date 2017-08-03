/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

function FAQ( { translate, heading = translate( 'Frequently Asked Questions' ), children } ) {
	return (
		<div className="faq">
			<h1 className="faq__heading">{ heading }</h1>
			<ul className="faq__list">
				{ children }
			</ul>
		</div>
	);
}

export default localize( FAQ );

