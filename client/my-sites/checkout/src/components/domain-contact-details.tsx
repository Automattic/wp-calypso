import config from '@automattic/calypso-config';
import { useShoppingCart } from '@automattic/shopping-cart';
import { Fragment } from 'react';
import ManagedContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields/managed-contact-details-form-fields';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import DomainContactDetailsTlds from 'calypso/my-sites/checkout/src/components/domain-contact-details-tlds';
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
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const needsOnlyGoogleAppsDetails =
		hasGoogleApps( responseCart ) &&
		! hasDomainRegistration( responseCart ) &&
		! hasTransferProduct( responseCart );
	const getIsFieldDisabled = () => isDisabled;
	const needsAlternateEmailForGSuite = needsOnlyGoogleAppsDetails;

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
			<DomainContactDetailsTlds
				domainNames={ domainNames }
				contactDetails={ contactDetails }
				contactDetailsErrors={ contactDetailsErrors }
				updateDomainContactFields={ updateDomainContactFields }
				shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
			/>
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
