import { ConfettiAnimation } from '@automattic/components';
import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import { emailManagement } from 'calypso/my-sites/email/paths';
import ThankYouLayout from '../redesign-v2/ThankYouLayout';
import DomainTransferToAnyUserFooter from '../redesign-v2/sections/footer/DomainTransferToAnyUserFooter';
import DefaultThankYouHeader from '../redesign-v2/sections/header/Default';
import ProductDomain from '../redesign-v2/sections/product/ProductDomain';
import DefaultSubHeader from '../redesign-v2/sections/subheader/Default';
import DefaultUpsell from '../redesign-v2/sections/upsell/Default';

interface DomainTransferToAnyUserContainerProps {
	domain: string;
}

const DomainTransferToAnyUser: React.FC< DomainTransferToAnyUserContainerProps > = ( {
	domain,
} ) => {
	return (
		<ThankYouLayout>
			<DefaultThankYouHeader>
				{ translate( 'Your domain transfer is underway' ) }
			</DefaultThankYouHeader>
			<DefaultSubHeader>
				{ translate(
					'Domain transfers can take a few minutes, we’ll email you once it’s set up.'
				) }
			</DefaultSubHeader>
			<ProductDomain domain={ domain } />
			<DomainTransferToAnyUserFooter />
			<DefaultUpsell
				title={ translate( 'Professional email' ) }
				description={ translate(
					'85% of people trust an email address with a custom domain name over a generic one.'
				) }
				meshColor="blue"
				icon={ emailImage }
				href={ emailManagement( domain, domain ) }
				buttonText={ translate( 'Add email' ) }
				trackEvent="calypso_domain_transfer_thank_you_professional_email_click"
			/>
			<ConfettiAnimation delay={ 1000 } />
		</ThankYouLayout>
	);
};

export default DomainTransferToAnyUser;
