import { DomainSearch } from '@automattic/domain-search';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import {
	type WPCOMDomainSearchProps,
	useWPCOMDomainSearchProps,
} from './use-wpcom-domain-search-props';

const DomainSearchWithCartAndAnalytics = ( props: WPCOMDomainSearchProps ) => {
	const wpcomDomainSearchProps = useWPCOMDomainSearchProps( props );

	return <DomainSearch { ...props } { ...wpcomDomainSearchProps } />;
};

export const WPCOMDomainSearch = ( props: WPCOMDomainSearchProps ) => {
	return (
		<CalypsoShoppingCartProvider>
			<DomainSearchWithCartAndAnalytics { ...props } />
		</CalypsoShoppingCartProvider>
	);
};
