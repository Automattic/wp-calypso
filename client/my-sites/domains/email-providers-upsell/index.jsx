import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function EmailProvidersUpsell( { domain } ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const comment = '%(domainName)s is the domain name, e.g example.com';

	return (
		<CalypsoShoppingCartProvider>
			<EmailProvidersComparison
				backPath={ domainAddNew( selectedSiteSlug ) }
				cartDomainName={ domain }
				comparisonContext="domain-upsell"
				headerTitle={ translate( 'Register %(domainName)s', {
					args: { domainName: domain },
					comment,
				} ) }
				hideEmailHeader
				hideEmailForwardingCard
				showSkipButton
				onSkipClick={ () => {
					page( `/checkout/${ selectedSiteSlug }` );
				} }
				promoHeaderTitle={ translate( 'Add a professional email address to %(domainName)s', {
					args: {
						domainName: domain,
					},
					comment,
				} ) }
				selectedDomainName={ domain }
				skipButtonLabel={ translate( 'Skip' ) }
			/>
		</CalypsoShoppingCartProvider>
	);
}
