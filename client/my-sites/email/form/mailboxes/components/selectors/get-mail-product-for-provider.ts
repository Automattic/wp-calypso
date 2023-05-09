import { ResponseDomain } from 'calypso/lib/domains/types';
import { getGSuiteProductSlug } from 'calypso/lib/gsuite';
import { getTitanProductSlug } from 'calypso/lib/titan';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { AppState } from 'calypso/types';

const getMailProductForProvider = (
	state: AppState,
	provider: EmailProvider,
	domain: ResponseDomain
): ProductListItem | null => {
	const titanMailProduct = getProductBySlug( state, getTitanProductSlug( domain ) as string );
	const gSuiteMailProduct = getProductBySlug( state, getGSuiteProductSlug( domain ) );

	return provider === EmailProvider.Titan ? titanMailProduct : gSuiteMailProduct;
};

export default getMailProductForProvider;
