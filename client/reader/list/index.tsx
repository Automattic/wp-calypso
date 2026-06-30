import { readSubscribedListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { UserLists } from 'calypso/reader/list/components/user-lists';
import type { JSX } from 'react';

export function ReaderLists(): JSX.Element {
	const translate = useTranslate();
	const { data, isLoading, isFetched } = useQuery( readSubscribedListsQuery() );
	const lists = data?.lists ?? [];

	return (
		<ReaderMain className="reader-lists-page">
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: translate( 'Lists' ),
					comment: '%s is the section name. For example: "Lists ‹ Reader"',
				} ) }
			/>

			<NavigationHeader
				title={ translate( 'Lists' ) }
				subtitle={ translate( 'Discover all your lists.' ) }
				className="reader-lists-header"
			/>

			<UserLists lists={ lists } isLoading={ isLoading || ! isFetched } />
		</ReaderMain>
	);
}

export default ReaderLists;
