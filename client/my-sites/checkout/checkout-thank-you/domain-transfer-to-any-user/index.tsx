import { translate } from 'i18n-calypso';
import Main from 'calypso/components/main';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import MasterbarStyled from '../redesign-v2/masterbar-styled';
import getDomainFooterDetails from '../redesign-v2/pages/content/get-domain-footer-details';
import ThankYouDomainProduct from '../redesign-v2/products/domain-product';

interface DomainTransferToAnyUserContainerProps {
	domain: string;
}

const DomainTransferToAnyUser: React.FC< DomainTransferToAnyUserContainerProps > = ( {
	domain,
} ) => {
	return (
		<Main className="checkout-thank-you is-redesign-v2">
			<MasterbarStyled canGoBack={ false } />

			<ThankYouV2
				title={ translate( 'Your domain transfer is underway' ) }
				subtitle={ translate(
					'Domain transfers can take a few minutes, we’ll email you once it’s set up.'
				) }
				products={ <ThankYouDomainProduct domainName={ domain } /> }
				footerDetails={ getDomainFooterDetails( 'transfer-to-user' ) }
			/>
		</Main>
	);
};

export default DomainTransferToAnyUser;
