import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { TableWithStoreContext } from './table';
import { ContentProps } from './types';

export const Content: React.FC< ContentProps > = ( {
	nav,
	header,
	footer,
	locale,
	rootUrl,
	urlQueryArgs,
} ) => {
	return (
		<>
			{ nav }

			<QueryProductsList type="jetpack" />
			<QueryIntroOffers />
			<CalypsoShoppingCartProvider>
				<Main>
					{ header }
					<TableWithStoreContext
						locale={ locale }
						rootUrl={ rootUrl }
						urlQueryArgs={ urlQueryArgs }
					/>
				</Main>
			</CalypsoShoppingCartProvider>
			{ footer }
		</>
	);
};
