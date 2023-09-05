import { useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { hasOnlyRenewalItems } from 'calypso/lib/cart-values/cart-items';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import { SummaryLine, SummaryDetails } from './summary-details';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

const GridRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

export default function WPContactFormSummary( {
	areThereDomainProductsInCart,
	isGSuiteInCart,
	isLoggedOutCart,
}: {
	areThereDomainProductsInCart: boolean;
	isGSuiteInCart: boolean;
	isLoggedOutCart: boolean;
} ) {
	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const isRenewal = hasOnlyRenewalItems( responseCart );

	// Check if paymentData is empty
	if ( Object.entries( contactInfo ).length === 0 ) {
		return null;
	}

	const fullName = joinNonEmptyValues(
		' ',
		contactInfo.firstName?.value,
		contactInfo.lastName?.value
	);

	return (
		<GridRow>
			<div>
				<SummaryDetails>
					{ ! isRenewal && ( isGSuiteInCart || areThereDomainProductsInCart ) && fullName && (
						<SummaryLine>{ fullName }</SummaryLine>
					) }

					{ ! isRenewal &&
						areThereDomainProductsInCart &&
						( contactInfo.organization?.value?.length ?? 0 ) > 0 && (
							<SummaryLine>{ contactInfo.organization?.value ?? '' } </SummaryLine>
						) }

					{ ! isRenewal &&
						( isGSuiteInCart || areThereDomainProductsInCart || isLoggedOutCart ) &&
						contactInfo.email?.value && <SummaryLine>{ contactInfo.email.value }</SummaryLine> }

					{ ! isRenewal &&
						areThereDomainProductsInCart &&
						( contactInfo.phone?.value?.length ?? 0 ) > 0 && (
							<SummaryLine>{ contactInfo.phone?.value ?? '' }</SummaryLine>
						) }
				</SummaryDetails>

				<AddressSummary
					responseCart={ responseCart }
					isRenewal={ isRenewal }
					contactInfo={ contactInfo }
					areThereDomainProductsInCart={ areThereDomainProductsInCart }
				/>
			</div>
		</GridRow>
	);
}

function joinNonEmptyValues( joinString: string, ...values: ( string | undefined )[] ) {
	return values.filter( ( value ) => ( value?.length ?? 0 ) > 0 ).join( joinString );
}

function AddressSummary( {
	responseCart,
	contactInfo,
	areThereDomainProductsInCart,
	isRenewal,
}: {
	responseCart: ResponseCart;
	contactInfo: ManagedContactDetails;
	areThereDomainProductsInCart: boolean;
	isRenewal: boolean;
} ) {
	// For carts which could be taxed, we display the postal code and country
	// from the cart's tax location rather than what is stored in the contact
	// details just in case they differ (eg: if the tax location has been changed
	// in another tab) so that what is displayed always matches what the cart is
	// using to calculate taxes. This does mean that the summary won't display
	// the postal code and country that will be sent to the transactions endpoint
	// for a domain product (it will be whatever was entered in the form) but
	// that is less risky since it will be validated before the transaction
	// completes and it will not affect the price like the tax location will.
	const postalCode =
		responseCart.total_cost_integer > 0
			? responseCart.tax.location.postal_code
			: contactInfo.postalCode?.value;
	const countryCode =
		responseCart.total_cost_integer > 0
			? responseCart.tax.location.country_code
			: contactInfo.countryCode?.value;
	const postalAndCountry = joinNonEmptyValues( ', ', postalCode, countryCode );

	if ( ! areThereDomainProductsInCart || isRenewal ) {
		return (
			<SummaryDetails>
				{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
			</SummaryDetails>
		);
	}

	const cityAndState = joinNonEmptyValues(
		', ',
		contactInfo.city?.value,
		contactInfo.state?.value
	);
	return (
		<SummaryDetails>
			{ ( contactInfo.address1?.value?.length ?? 0 ) > 0 && (
				<SummaryLine>{ contactInfo.address1?.value ?? '' } </SummaryLine>
			) }

			{ ( contactInfo.address2?.value?.length ?? 0 ) > 0 && (
				<SummaryLine>{ contactInfo.address2?.value ?? '' } </SummaryLine>
			) }

			{ cityAndState && <SummaryLine>{ cityAndState }</SummaryLine> }

			{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
		</SummaryDetails>
	);
}
