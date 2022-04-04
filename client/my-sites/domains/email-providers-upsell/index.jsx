import { isEnabled } from '@automattic/calypso-config';
import { TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-stacked-comparison';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function EmailProvidersUpsell( { domain, interval, provider } ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const comment = '%(domainName)s is the domain name, e.g example.com';

	return (
		<CalypsoShoppingCartProvider>
			{ ! isEnabled( 'emails/show-new-comparison-component' ) ? (
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
					titanProductSlug={ TITAN_MAIL_YEARLY_SLUG }
				/>
			) : (
				<EmailProvidersStackedComparison
					comparisonContext="domain-upsell"
					isDomainInCart={ true }
					selectedDomainName={ domain }
					selectedEmailProviderSlug={ provider }
					selectedIntervalLength={ interval }
					source="domain-upsell"
				/>
			) }
		</CalypsoShoppingCartProvider>
	);
}
