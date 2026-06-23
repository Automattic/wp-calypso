import { getSiteSubscriptionSourceKey, type SiteSubscriptionItem } from '@automattic/api-core';
import { AutoSizer, List } from '@automattic/react-virtualized';
import { useFuzzySearch } from '@automattic/search';
import {
	Button,
	SearchControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import Skeleton from 'calypso/reader/components/skeleton';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { SourceSubscription } from './source-subscription';
import type { CSSProperties } from 'react';

interface Props {
	selectedSourceKeys: string[];
	selectedCount: number;
	onAddDraftSource?: ( subscription: SiteSubscriptionItem ) => void;
	onRemoveDraftSource?: ( subscription: SiteSubscriptionItem ) => void;
}

type Filter = 'all' | 'selected';

type SourcesContentState = 'loading' | 'error' | 'empty' | 'list';

const SOURCE_ROW_HEIGHT = 64;
const SOURCE_ROW_GAP = 8;

// Stable identity so `useFuzzySearch` can reuse its Fuse instance across renders.
const SEARCH_KEYS: ( keyof SiteSubscriptionItem )[] = [ 'name', 'URL', 'feed_URL' ];

type SourceRowRendererProps = {
	index: number;
	key: string;
	style: CSSProperties;
};

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

export function SourcesTab( {
	selectedSourceKeys,
	selectedCount,
	onAddDraftSource,
	onRemoveDraftSource,
}: Props ) {
	const translate = useTranslate();
	// This tab only mounts while it's the active TabPanel tab, so the (paginating)
	// subscriptions query only runs once the user opens Sources.
	const siteSubscriptions = useSiteSubscriptions( { fetchAllPages: true, enabled: true } );

	const [ filter, setFilter ] = useState< Filter >( 'all' );
	const [ search, setSearch ] = useState( '' );

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

	const handleAddSource = useCallback(
		( subscription: SiteSubscriptionItem ) => {
			onAddDraftSource?.( subscription );
		},
		[ onAddDraftSource ]
	);
	const handleRemoveSource = useCallback(
		( subscription: SiteSubscriptionItem ) => {
			onRemoveDraftSource?.( subscription );
		},
		[ onRemoveDraftSource ]
	);
	const renderSourceRow = useCallback(
		( { index, key, style }: SourceRowRendererProps ) => {
			const subscription = filteredSubscriptions[ index ];

			if ( ! subscription ) {
				return null;
			}

			const isAdded = selectedKeys.has( getSiteSubscriptionSourceKey( subscription ) );

			return (
				<div
					key={ key }
					role="presentation"
					style={ {
						...style,
						boxSizing: 'border-box',
						paddingBottom: SOURCE_ROW_GAP,
					} }
				>
					<SourceSubscription
						subscription={ subscription }
						isAdded={ isAdded }
						onAdd={ handleAddSource }
						onRemove={ handleRemoveSource }
					/>
				</div>
			);
		},
		[ filteredSubscriptions, handleAddSource, handleRemoveSource, selectedKeys ]
	);

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
					onClick={ () => setFilter( 'all' ) }
				>
					{ translate( 'All subscriptions' ) }
				</Button>
				<Button
					variant={ filter === 'selected' ? 'primary' : 'secondary' }
					onClick={ () => setFilter( 'selected' ) }
				>
					{ translate( 'In this space · %(count)d', { args: { count: selectedCount } } ) }
				</Button>
			</HStack>

			<SourcesTabContent
				state={ sourcesState }
				filter={ filter }
				filteredSubscriptions={ filteredSubscriptions }
				renderSourceRow={ renderSourceRow }
				translate={ translate }
			/>
		</VStack>
	);
}

type SourcesTabContentProps = {
	state: SourcesContentState;
	filter: Filter;
	filteredSubscriptions: SiteSubscriptionItem[];
	renderSourceRow: ( props: SourceRowRendererProps ) => React.ReactNode;
	translate: ReturnType< typeof useTranslate >;
};

function SourcesTabContent( {
	state,
	filter,
	filteredSubscriptions,
	renderSourceRow,
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
				<p className="space-sources__empty">
					{ filter === 'selected'
						? translate( 'No subscriptions added to this space yet.' )
						: translate( 'No subscriptions found.' ) }
				</p>
			);
		case 'list':
		default:
			return (
				<div className="space-sources__list" role="list">
					<AutoSizer>
						{ ( { width, height }: { width: number; height: number } ) => (
							<List
								className="space-sources__virtualized-list"
								containerRole="presentation"
								height={ height }
								overscanRowCount={ 4 }
								role="presentation"
								rowCount={ filteredSubscriptions.length }
								rowHeight={ SOURCE_ROW_HEIGHT }
								rowRenderer={ renderSourceRow }
								width={ width }
							/>
						) }
					</AutoSizer>
				</div>
			);
	}
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
