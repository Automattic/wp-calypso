import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import ManagedContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields/managed-contact-details-form-fields';
import RegistrantExtraInfoForm from 'calypso/components/domains/registrant-extra-info';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import { getTopLevelOfTld } from 'calypso/lib/domains';
import type { DomainContactDetails as DomainContactDetailsData } from '@automattic/shopping-cart';
import type {
	DomainContactDetailsErrors,
	ManagedContactDetails,
	ManagedContactDetailsRequiredMask,
} from '@automattic/wpcom-checkout';

export default function DomainContactDetails( {
	domainNames,
	contactDetails,
	contactDetailsErrors,
	updateDomainContactFields,
	updateRequiredDomainFields,
	getIsFieldRequired,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
	isLoggedOutCart,
	emailOnly,
}: {
	domainNames: string[];
	contactDetails: DomainContactDetailsData;
	contactDetailsErrors: DomainContactDetailsErrors;
	updateDomainContactFields: ( details: DomainContactDetailsData ) => void;
	updateRequiredDomainFields?: (
		details: ManagedContactDetails,
		requiredMask: ManagedContactDetailsRequiredMask
	) => ManagedContactDetails;
	getIsFieldRequired?: (
		field: Exclude< keyof ManagedContactDetails, 'tldExtraFields' >
	) => boolean;
	shouldShowContactDetailsValidationErrors: boolean;
	isDisabled: boolean;
	isLoggedOutCart: boolean;
	emailOnly?: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const { responseCart } = useShoppingCart();
	const needsOnlyGoogleAppsDetails =
		hasGoogleApps( responseCart ) &&
		! hasDomainRegistration( responseCart ) &&
		! hasTransferProduct( responseCart );
	const getIsFieldDisabled = () => isDisabled;
	const needsAlternateEmailForGSuite = needsOnlyGoogleAppsDetails;
	const tlds = getAllTopLevelTlds( domainNames );

	return (
		<React.Fragment>
			<ManagedContactDetailsFormFields
				needsOnlyGoogleAppsDetails={ needsOnlyGoogleAppsDetails }
				needsAlternateEmailForGSuite={ needsAlternateEmailForGSuite }
				contactDetails={ contactDetails }
				contactDetailsErrors={
					shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
				}
				onContactDetailsChange={ updateDomainContactFields }
				getIsFieldRequired={ getIsFieldRequired }
				getIsFieldDisabled={ getIsFieldDisabled }
				isLoggedOutCart={ isLoggedOutCart }
				emailOnly={ emailOnly }
			/>
			{ tlds.includes( 'ca' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.ca ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					updateRequiredDomainFields={ updateRequiredDomainFields }
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
		</React.Fragment>
	);
}

DomainContactDetails.defaultProps = { emailOnly: false };

function getAllTopLevelTlds( domainNames: string[] ): string[] {
	return Array.from( new Set( domainNames.map( getTopLevelOfTld ) ) ).sort();
}
