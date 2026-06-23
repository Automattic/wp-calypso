import { getSiteSubscriptionSourceKey, type SiteSubscriptionItem } from '@automattic/api-core';
import { useFuzzySearch } from '@automattic/search';
import {
	Button,
	SearchControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import Skeleton from 'calypso/reader/components/skeleton';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { SourceSubscription } from './source-subscription';

interface Props {
	selectedSourceKeys: string[];
	onAddDraftSource: ( subscription: SiteSubscriptionItem ) => void;
	onRemoveDraftSource: ( subscription: SiteSubscriptionItem ) => void;
}

type Filter = 'all' | 'selected';

type SourcesContentState = 'loading' | 'error' | 'empty' | 'list';

// Estimated row height in px (corrected per-row once measured) and the gap the
// virtualizer inserts between rows — set via the hook's `gap`, not CSS margins.
const SOURCE_ROW_ESTIMATE = 56;
const SOURCE_ROW_GAP = 8;

// Stable identity so `useFuzzySearch` can reuse its Fuse instance across renders.
const SEARCH_KEYS: ( keyof SiteSubscriptionItem )[] = [ 'name', 'URL', 'feed_URL' ];

const getSourcesContentState = ( {
	isLoading,
	isError,
	isEmpty,
}: {
	isLoading: boolean;
	isError: boolean;
	isEmpty: boolean;
} ): SourcesContentState => {
	if ( isLoading ) {
		return 'loading';
	}
	if ( isError ) {
		return 'error';
	}
	if ( isEmpty ) {
		return 'empty';
	}
	return 'list';
};

export function SourcesTab( { selectedSourceKeys, onAddDraftSource, onRemoveDraftSource }: Props ) {
	const translate = useTranslate();
	// This tab only mounts while it's the active TabPanel tab, so the (paginating)
	// subscriptions query only runs once the user opens Sources.
	const siteSubscriptions = useSiteSubscriptions( { fetchAllPages: true, enabled: true } );

	const [ filter, setFilter ] = useState< Filter >( 'all' );
	const [ search, setSearch ] = useState( '' );

	const selectedCount = selectedSourceKeys.length;
	const selectedKeys = useMemo( () => new Set( selectedSourceKeys ), [ selectedSourceKeys ] );

	const subscriptionsForFilter = useMemo( () => {
		if ( filter !== 'selected' ) {
			return siteSubscriptions.subscriptions;
		}
		return siteSubscriptions.subscriptions.filter( ( subscription ) =>
			selectedKeys.has( getSiteSubscriptionSourceKey( subscription ) )
		);
	}, [ filter, selectedKeys, siteSubscriptions.subscriptions ] );

	const filteredSubscriptions = useFuzzySearch( {
		data: subscriptionsForFilter,
		keys: SEARCH_KEYS,
		query: search.trim(),
	} );

	const sourcesState = getSourcesContentState( {
		isLoading: siteSubscriptions.isLoading,
		isError: siteSubscriptions.isError,
		isEmpty: filteredSubscriptions.length === 0,
	} );

	return (
		<VStack spacing={ 4 } justify="flex-start" className="space-sources">
			<p className="space-sources__description">
				{ translate( 'Choose which of your subscriptions appear in this space.' ) }
			</p>

			<SearchControl
				__nextHasNoMarginBottom
				label={ translate( 'Search your subscriptions' ) }
				value={ search }
				onChange={ ( value = '' ) => setSearch( value ) }
				placeholder={ translate( 'Search your subscriptions…' ) }
				className="space-sources__search"
			/>

			<HStack justify="flex-start" spacing={ 2 } className="space-sources__filters">
				<Button
					variant={ filter === 'all' ? 'primary' : 'secondary' }
					aria-pressed={ filter === 'all' }
					onClick={ () => setFilter( 'all' ) }
				>
					{ translate( 'All subscriptions' ) }
				</Button>
				<Button
					variant={ filter === 'selected' ? 'primary' : 'secondary' }
					aria-pressed={ filter === 'selected' }
					onClick={ () => setFilter( 'selected' ) }
				>
					{ translate( 'In this space · %(count)d', { args: { count: selectedCount } } ) }
				</Button>
			</HStack>

			<SourcesTabContent
				state={ sourcesState }
				filter={ filter }
				filteredSubscriptions={ filteredSubscriptions }
				selectedKeys={ selectedKeys }
				onAdd={ onAddDraftSource }
				onRemove={ onRemoveDraftSource }
				translate={ translate }
			/>
		</VStack>
	);
}

type SourcesTabContentProps = {
	state: SourcesContentState;
	filter: Filter;
	filteredSubscriptions: SiteSubscriptionItem[];
	selectedKeys: Set< string >;
	onAdd: ( subscription: SiteSubscriptionItem ) => void;
	onRemove: ( subscription: SiteSubscriptionItem ) => void;
	translate: ReturnType< typeof useTranslate >;
};

function SourcesTabContent( {
	state,
	filter,
	filteredSubscriptions,
	selectedKeys,
	onAdd,
	onRemove,
	translate,
}: SourcesTabContentProps ) {
	switch ( state ) {
		case 'loading':
			return <SourcesTabSkeleton label={ translate( 'Loading subscriptions' ) as string } />;
		case 'error':
			return (
				<p className="space-sources__empty" role="alert">
					{ translate( 'We couldn’t load your subscriptions. Please try again.' ) }
				</p>
			);
		case 'empty':
			return (
				// `role="status"` so a search/filter that yields zero results is announced.
				<p className="space-sources__empty" role="status">
					{ filter === 'selected'
						? translate( 'No subscriptions added to this space yet.' )
						: translate( 'No subscriptions found.' ) }
				</p>
			);
		case 'list':
		default:
			return (
				<SourcesVirtualList
					subscriptions={ filteredSubscriptions }
					selectedKeys={ selectedKeys }
					onAdd={ onAdd }
					onRemove={ onRemove }
				/>
			);
	}
}

type SourcesVirtualListProps = {
	subscriptions: SiteSubscriptionItem[];
	selectedKeys: Set< string >;
	onAdd: ( subscription: SiteSubscriptionItem ) => void;
	onRemove: ( subscription: SiteSubscriptionItem ) => void;
};

function SourcesVirtualList( {
	subscriptions,
	selectedKeys,
	onAdd,
	onRemove,
}: SourcesVirtualListProps ) {
	// State (not a ref) so the virtualizer re-evaluates once the scroll container
	// mounts. The list is fully loaded (`fetchAllPages`), so the hook is used for
	// windowing only — no `hasMore` / `loadMore`.
	const [ scrollElement, setScrollElement ] = useState< HTMLElement | null >( null );

	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: subscriptions.length,
		estimateSize: SOURCE_ROW_ESTIMATE,
		gap: SOURCE_ROW_GAP,
		overscan: 6,
		getItemKey: ( index ) => getSiteSubscriptionSourceKey( subscriptions[ index ] ),
	} );

	return (
		<div className="space-sources__list" ref={ setScrollElement }>
			<div { ...getListProps( { className: 'space-sources__virtualized-list' } ) } role="list">
				{ items.map( ( virtualRow ) => {
					const subscription = subscriptions[ virtualRow.index ];
					if ( ! subscription ) {
						return null;
					}
					const isAdded = selectedKeys.has( getSiteSubscriptionSourceKey( subscription ) );
					return (
						<div
							key={ virtualRow.key }
							data-index={ virtualRow.index }
							ref={ measureElement }
							role="presentation"
							className="space-sources__virtual-row"
							style={ { transform: `translateY(${ virtualRow.start - scrollMargin }px)` } }
						>
							<SourceSubscription
								subscription={ subscription }
								isAdded={ isAdded }
								onAdd={ onAdd }
								onRemove={ onRemove }
							/>
						</div>
					);
				} ) }
			</div>
		</div>
	);
}

function SourcesTabSkeleton( { label }: { label: string } ) {
	return (
		<VStack
			spacing={ 3 }
			className="space-sources__list"
			role="status"
			aria-label={ label }
			aria-live="polite"
		>
			{ Array.from( { length: 6 }, ( _value, index ) => (
				<HStack
					key={ index }
					spacing={ 3 }
					alignment="center"
					justify="space-between"
					className="space-sources__skeleton-row"
					style={ { minHeight: 56 } }
				>
					<Skeleton shape="circle" width="40px" height="40px" />
					<VStack spacing={ 2 } className="space-sources__skeleton-text">
						<Skeleton width="180px" height="18px" />
						<Skeleton width="120px" height="14px" />
					</VStack>
					<Skeleton width="86px" height="40px" />
				</HStack>
			) ) }
		</VStack>
	);
}
