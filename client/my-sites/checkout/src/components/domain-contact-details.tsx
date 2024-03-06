import config from '@automattic/calypso-config';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import ManagedContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields/managed-contact-details-form-fields';
import RegistrantExtraInfoForm from 'calypso/components/domains/registrant-extra-info';
import RegistrantExtraInfoFrForm from 'calypso/components/domains/registrant-extra-info/fr-form';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import { getTopLevelOfTld } from 'calypso/lib/domains';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { VatForm } from './vat-form';
import type { DomainContactDetails as DomainContactDetailsData } from '@automattic/shopping-cart';
import type { DomainContactDetailsErrors } from '@automattic/wpcom-checkout';

export default function DomainContactDetails( {
	domainNames,
	contactDetails,
	contactDetailsErrors,
	updateDomainContactFields,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
	isLoggedOutCart,
	emailOnly,
}: {
	domainNames: string[];
	contactDetails: DomainContactDetailsData;
	contactDetailsErrors: DomainContactDetailsErrors;
	updateDomainContactFields: ( details: DomainContactDetailsData ) => void;
	shouldShowContactDetailsValidationErrors: boolean;
	isDisabled: boolean;
	isLoggedOutCart: boolean;
	emailOnly?: boolean;
} ) {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const needsOnlyGoogleAppsDetails =
		hasGoogleApps( responseCart ) &&
		! hasDomainRegistration( responseCart ) &&
		! hasTransferProduct( responseCart );
	const getIsFieldDisabled = () => isDisabled;
	const needsAlternateEmailForGSuite = needsOnlyGoogleAppsDetails;
	const tlds = getAllTopLevelTlds( domainNames );

	const isVatSupported = config.isEnabled( 'checkout/vat-form' );

	return (
		<Fragment>
			<ManagedContactDetailsFormFields
				needsOnlyGoogleAppsDetails={ needsOnlyGoogleAppsDetails }
				needsAlternateEmailForGSuite={ needsAlternateEmailForGSuite }
				contactDetails={ contactDetails }
				contactDetailsErrors={
					shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
				}
				onContactDetailsChange={ updateDomainContactFields }
				getIsFieldDisabled={ getIsFieldDisabled }
				isLoggedOutCart={ isLoggedOutCart }
				emailOnly={ emailOnly }
			/>
			{ tlds.includes( 'ca' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.ca ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					tld="ca"
					getDomainNames={ () => domainNames }
				/>
			) }
			{ tlds.includes( 'uk' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.uk ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					tld="uk"
					getDomainNames={ () => domainNames }
				/>
			) }
			{ tlds.includes( 'fr' ) && (
				<RegistrantExtraInfoFrForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.fr ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
				/>
			) }
			{ isVatSupported && (
				<VatForm
					section="domain-contact-form"
					isDisabled={ isDisabled }
					countryCode={ contactDetails.countryCode }
				/>
			) }
		</Fragment>
	);
}

DomainContactDetails.defaultProps = { emailOnly: false };

function getAllTopLevelTlds( domainNames: string[] ): string[] {
	return Array.from( new Set( domainNames.map( getTopLevelOfTld ) ) ).sort();
}
