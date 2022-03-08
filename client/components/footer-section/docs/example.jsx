import FooterSection from 'calypso/components/footer-section';

const header = 'The Header';
const content = 'The content goes here, it can be a list of cards.';

const FooterSectionExample = () => {
	return <FooterSection header={ header }>{ content }</FooterSection>;
};

FooterSectionExample.displayName = 'FooterSectionExample';

export default FooterSectionExample;
