import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import ManagedContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields/managed-contact-details-form-fields';
import RegistrantExtraInfoForm from 'calypso/components/domains/registrant-extra-info';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import { getTopLevelOfTld } from 'calypso/lib/domains';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
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
} ): JSX.Element {
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
					tld={ 'ca' }
					getDomainNames={ () => domainNames }
					translate={ translate }
					isManaged={ true }
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
					tld={ 'uk' }
					getDomainNames={ () => domainNames }
					translate={ translate }
					isManaged={ true }
				/>
			) }
			{ tlds.includes( 'fr' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.fr ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					tld={ 'fr' }
					getDomainNames={ () => domainNames }
					translate={ translate }
					isManaged={ true }
				/>
			) }
		</Fragment>
	);
}

DomainContactDetails.defaultProps = { emailOnly: false };

function getAllTopLevelTlds( domainNames: string[] ): string[] {
	return Array.from( new Set( domainNames.map( getTopLevelOfTld ) ) ).sort();
}
