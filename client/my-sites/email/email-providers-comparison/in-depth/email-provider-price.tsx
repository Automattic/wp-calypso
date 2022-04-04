import { useShoppingCart } from '@automattic/shopping-cart';
import { useSelector } from 'react-redux';
import { hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import { getSelectedDomain } from 'calypso/lib/domains';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import GoogleWorkspacePrice from 'calypso/my-sites/email/email-providers-comparison/price/google-workspace';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProviderPriceProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

const EmailProviderPrice = ( {
	emailProviderSlug,
	intervalLength,
	selectedDomainName,
}: EmailProviderPriceProps ): ReactElement => {
	const selectedSite = useSelector( getSelectedSite );
	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );
	const isDomainInCart = hasDomainInCart( shoppingCartManager.responseCart, selectedDomainName );

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );

	if ( emailProviderSlug === GOOGLE_WORKSPACE_PRODUCT_TYPE ) {
		return (
			<GoogleWorkspacePrice
				domain={ domain }
				isDomainInCart={ isDomainInCart }
				intervalLength={ intervalLength }
			/>
		);
	}

	return (
		<ProfessionalEmailPrice
			domain={ domain }
			isDomainInCart={ isDomainInCart }
			intervalLength={ intervalLength }
		/>
	);
};

export default EmailProviderPrice;
