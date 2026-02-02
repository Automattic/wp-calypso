import { useState } from '@wordpress/element';
import { Icon, chevronDown } from '@wordpress/icons';

function FaqAccordion( { question, answer } ) {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<div className="blaze-faq-accordion">
			<button
				className="blaze-faq-accordion__header"
				onClick={ () => setIsOpen( ! isOpen ) }
				aria-expanded={ isOpen }
			>
				<span className="blaze-faq-accordion__question">{ question }</span>
				<Icon
					icon={ chevronDown }
					className={ `blaze-faq-accordion__icon ${ isOpen ? 'is-open' : '' }` }
				/>
			</button>
			{ isOpen && <div className="blaze-faq-accordion__content">{ answer }</div> }
		</div>
	);
}

export default FaqAccordion;
