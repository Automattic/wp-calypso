import { SocialAccountRow, SocialAccountRowProps } from './account-row';
import { SocialFeedList } from './components/feed-list';
import type { SocialError } from './types';

/**
 * Slim, presentation-only shape consumed by SocialAccountList. Defining
 * this here (instead of a Pick<> over the upstream UseInfiniteQueryResult)
 * lets per-protocol callers project their own error type onto SocialError
 * via a useMemo without casting through `unknown` to reconcile the
 * upstream generics.
 */
export interface SocialAccountListQuery< T > {
	data: { pages: Array< { items: T[]; cursor: string | null } > } | undefined;
	isPending: boolean;
	isError: boolean;
	error: SocialError | null | undefined;
	hasNextPage: boolean | undefined;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	refetch: () => void;
}

export interface SocialAccountListProps< T > {
	query: SocialAccountListQuery< T >;
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
	const items = props.query.data?.pages.flatMap( ( page ) => page.items ) ?? [];

	return (
		<SocialFeedList< T >
			items={ items }
			isPending={ props.query.isPending }
			isError={ props.query.isError }
			error={ props.query.error ?? null }
			hasNextPage={ Boolean( props.query.hasNextPage ) }
			isFetchingNextPage={ Boolean( props.query.isFetchingNextPage ) }
			fetchNextPage={ props.query.fetchNextPage }
			refetch={ props.query.refetch }
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
