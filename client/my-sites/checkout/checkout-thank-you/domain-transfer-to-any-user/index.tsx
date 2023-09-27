import { translate } from 'i18n-calypso';
import ThankYouLayout from '../redesign-v2/ThankYouLayout';
import DomainTransferToAnyUserFooter from '../redesign-v2/sections/footer/DomainTransferToAnyUserFooter';
import DefaultThankYouHeader from '../redesign-v2/sections/header/Default';
import ProductDomain from '../redesign-v2/sections/product/ProductDomain';
import DefaultSubHeader from '../redesign-v2/sections/subheader/Default';

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
			<DomainTransferToAnyUserFooter domain={ domain } />
		</ThankYouLayout>
	);
};

export default DomainTransferToAnyUser;
