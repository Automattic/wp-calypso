/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

const FAQ = React.createClass( {

	propTypes: {
		heading: PropTypes.string,
		items: PropTypes.arrayOf(
			PropTypes.shape( {
				question: PropTypes.string.isRequired,
				answer: PropTypes.node.isRequired
			} )
		).isRequired
	},

	getDefaultProps() {
		return {
			heading: 'Frequently Asked Questions'
		};
	},

	render() {
		const { heading, items } = this.props;

		return (
			<div className="faq">
				<h1 className="faq__heading">{ i18n.translate( heading ) }</h1>
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
	}

} );

export default FAQ;
