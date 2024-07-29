import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import { TableWithStoreAccess } from './table';
import { ContentProps } from './types';

export const Content: React.FC< ContentProps > = ( {
	nav,
	header,
	footer,
	locale,
	rootUrl,
	urlQueryArgs,
} ) => {
	const translate = useTranslate();

	return (
		<>
			<DocumentHead
				title={ translate( 'Full Jetpack plan listing and price comparison – Jetpack' ) }
				skipTitleFormatting
			/>
			{ nav }

			<QueryProductsList type="jetpack" />
			<QueryIntroOffers />
			<Main>
				{ header }
				<TableWithStoreAccess locale={ locale } rootUrl={ rootUrl } urlQueryArgs={ urlQueryArgs } />
			</Main>
			{ footer }
		</>
	);
};
