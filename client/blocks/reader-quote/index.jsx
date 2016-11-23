/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import getRandomQuote from './quotes';

export default () => {
	const quote = getRandomQuote();
	return (
		<div className="reader-quote">
			<div className="reader-quote__content">
				{ quote.content }
			</div>
			<div className="reader-quote__author">
				{ quote.author }
			</div>
		</div>
	);
};
