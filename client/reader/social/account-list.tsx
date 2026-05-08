import { SocialAccountRow, SocialAccountRowProps } from './account-row';
import { SocialFeedList } from './components/feed-list';
import type { SocialError } from './types';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

export interface SocialAccountListProps< T > {
	query: Pick<
		UseInfiniteQueryResult< { pages: { items: T[]; cursor: string | null }[] }, SocialError >,
		| 'data'
		| 'isPending'
		| 'isError'
		| 'error'
		| 'hasNextPage'
		| 'isFetchingNextPage'
		| 'fetchNextPage'
		| 'refetch'
	>;
	renderItem: ( item: T ) => SocialAccountRowProps;
	itemKey: ( item: T ) => string;
	emptyTitle: string;
	emptyLine: string;
	emptyActionLabel?: string;
	emptyActionURL?: string;
	protocolLabel: string;
	protocolHomeURL: string;
	protocolHomeLabel: string;
}

export function SocialAccountList< T >( props: SocialAccountListProps< T > ) {
	const items = ( props.query.data?.pages.flatMap( ( page ) => page.items ) ?? [] ) as T[];

	return (
		<SocialFeedList< T >
			items={ items }
			isPending={ props.query.isPending }
			isError={ props.query.isError }
			error={ props.query.error ?? null }
			hasNextPage={ Boolean( props.query.hasNextPage ) }
			isFetchingNextPage={ Boolean( props.query.isFetchingNextPage ) }
			fetchNextPage={ props.query.fetchNextPage as () => void }
			refetch={ props.query.refetch as () => void }
			renderItem={ ( item ) => <SocialAccountRow { ...props.renderItem( item ) } /> }
			itemKey={ props.itemKey }
			emptyTitle={ props.emptyTitle }
			emptyLine={ props.emptyLine }
			emptyActionLabel={ props.emptyActionLabel }
			emptyActionURL={ props.emptyActionURL }
			protocolLabel={ props.protocolLabel }
			protocolHomeURL={ props.protocolHomeURL }
			protocolHomeLabel={ props.protocolHomeLabel }
		/>
	);
}
