import './account-list.scss';

import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
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

export interface SocialAccountListHeader {
	/** Display name; null falls back to '@' + handle. */
	displayName: string | null;
	handle: string;
	/** Resolved count, or null when the profile fetch is loading or errored. */
	count: number | null;
	mode: 'followers' | 'following';
	isPending: boolean;
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
	/** Optional header rendered above the list (e.g. on followers/following views). */
	header?: SocialAccountListHeader;
}

function AccountListHeader( {
	displayName,
	handle,
	count,
	mode,
	isPending,
}: SocialAccountListHeader ) {
	const translate = useTranslate();

	if ( isPending ) {
		return (
			<div className="social-account-list-header-skeleton" aria-hidden="true">
				<div className="social-account-list-header-skeleton__name" />
				<div className="social-account-list-header-skeleton__count" />
			</div>
		);
	}

	const heading = displayName && displayName.length > 0 ? displayName : `@${ handle }`;

	let countLine: string | null = null;
	if ( count !== null ) {
		const formatted = formatNumber( count );
		countLine =
			mode === 'followers'
				? String(
						translate( '%(count)s follower', '%(count)s followers', {
							count,
							args: { count: formatted },
						} )
				  )
				: String(
						translate( '%(count)s following', '%(count)s following', {
							count,
							args: { count: formatted },
						} )
				  );
	}

	return (
		<div className="social-account-list-header">
			<h2 className="social-account-list-header__display-name">{ heading }</h2>
			{ countLine !== null && <p className="social-account-list-header__count">{ countLine }</p> }
		</div>
	);
}

export function SocialAccountList< T >( props: SocialAccountListProps< T > ) {
	const items = props.query.data?.pages.flatMap( ( page ) => page.items ) ?? [];

	return (
		<>
			{ props.header && <AccountListHeader { ...props.header } /> }
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
		</>
	);
}
