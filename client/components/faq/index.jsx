/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

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

