import Section from 'calypso/components/section';

const header = 'The Header';
const content = 'The content goes here, it can be a list of cards.';

const SectionExample = () => {
	return <Section header={ header }>{ content }</Section>;
};

SectionExample.displayName = 'SectionExample';

export default SectionExample;
