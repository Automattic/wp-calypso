/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const FAQ = ( { heading, items } ) => {
	return (
		<div className="faq">
			<h1 className="faq__heading">{ heading }</h1>
			<ul className="faq__list">
				{
					items.map( ( { question, answer }, ind ) =>
						<li className="faq__item" key={ `faq-${ ind }` }>
							<h4 className="faq__question">{ question }</h4>
							<p className="faq__answer">{ answer }</p>
						</li>
					)
				}
			</ul>
		</div>
	);
};

FAQ.propTypes = {
	heading: PropTypes.string.isRequired,
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			question: PropTypes.string.isRequired,
			answer: PropTypes.node.isRequired
		} )
	).isRequired
};

export default FAQ;

