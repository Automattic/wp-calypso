import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import { TableWithStoreContext } from './table';
import { ContentProps } from './types';

export const Content: React.FC< ContentProps > = ( {
	nav,
	header,
	footer,
	locale,
	urlQueryArgs,
} ) => {
	return (
		<>
			{ nav }

			<QueryProductsList type="jetpack" />
			<QueryIntroOffers />
			<Main>
				{ header }
				<TableWithStoreContext locale={ locale } urlQueryArgs={ urlQueryArgs } />
			</Main>
			{ footer }
		</>
	);
};
