/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const FAQItem = ( { question, answer } ) => {
	return (
		<li className="faq__item">
			<h4 className="faq__question">{ question }</h4>
			<p className="faq__answer">{ answer }</p>
		</li>
	);
};

FAQItem.propTypes = {
	// Translations can include <a> links, that's why propType `node` is needed.
	question: PropTypes.node.isRequired,
	answer: PropTypes.node.isRequired
};

export default FAQItem;

