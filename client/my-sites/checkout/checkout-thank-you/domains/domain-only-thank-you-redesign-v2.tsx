import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import { emailManagement } from 'calypso/my-sites/email/paths';
import ThankYouLayout from '../redesign-v2/ThankYouLayout';
import DomainOnlyFooter from '../redesign-v2/sections/footer/DomainOnlyFooter';
import DefaultThankYouHeader from '../redesign-v2/sections/header/Default';
import ProductDomain from '../redesign-v2/sections/product/ProductDomain';
import DefaultSubHeader from '../redesign-v2/sections/subheader/Default';
import DefaultUpsell from '../redesign-v2/sections/upsell/Default';

interface DomainOnlyThankYouContainerProps {
	domains: string[];
}

const DomainOnlyThankYou: React.FC< DomainOnlyThankYouContainerProps > = ( { domains } ) => {
	const firstDomain = domains[ 0 ];
	return (
		<ThankYouLayout>
			<DefaultThankYouHeader>{ translate( 'Your own corner of the web' ) }</DefaultThankYouHeader>
			<DefaultSubHeader>
				{ translate(
					'All set! We’re just setting up your new domain so you can start spreading the word.'
				) }
			</DefaultSubHeader>
			{ domains.map( ( domain ) => (
				<ProductDomain shareSite key={ domain } domain={ domain } />
			) ) }
			<DomainOnlyFooter />
			<DefaultUpsell
				title={ translate( 'Professional email' ) }
				description={ translate(
					'85% of people trust an email address with a custom domain name over a generic one.'
				) }
				meshColor="blue"
				icon={ emailImage }
				href={ emailManagement( firstDomain, firstDomain ) }
				buttonText={ translate( 'Add email' ) }
				trackEvent="calypso_domain_only_thank_you_professional_email_click"
			/>
		</ThankYouLayout>
	);
};

export default DomainOnlyThankYou;
