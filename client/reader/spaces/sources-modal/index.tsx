import {
	getReadSpaceSourceKey,
	getSiteSubscriptionSourceKey,
	type SiteSubscriptionItem,
} from '@automattic/api-core';
import { AutoSizer, List } from '@automattic/react-virtualized';
import { useFuzzySearch } from '@automattic/search';
import {
	Button,
	Modal,
	SearchControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import Skeleton from 'calypso/reader/components/skeleton';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { useAddSpaceSource, useDeleteSpaceSource, useSpace } from 'calypso/reader/data/spaces';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { SourceSubscription } from './subscription';
import type { CSSProperties } from 'react';

import './style.scss';

interface Props {
	isOpen: boolean;
	spaceId: string | null;
	onClose: () => void;
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

export function SourcesModal( { isOpen, spaceId, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	// Only fetch while the modal is open — `view.tsx` keeps this mounted with
	// `isOpen` toggling, so gating avoids background pagination when it's closed.
	const {
		data: space,
		isLoading: isSpaceLoading,
		isError: isSpaceError,
	} = useSpace( spaceId, {
		enabled: isOpen,
	} );
	const siteSubscriptions = useSiteSubscriptions( { fetchAllPages: true, enabled: isOpen } );
	const { mutate: addSpaceSource } = useAddSpaceSource();
	const { mutate: deleteSpaceSource } = useDeleteSpaceSource();

	const [ filter, setFilter ] = useState< Filter >( 'all' );
	const [ search, setSearch ] = useState( '' );

	const selectedKeys = useMemo(
		() => new Set( ( space?.sources ?? [] ).map( ( source ) => getReadSpaceSourceKey( source ) ) ),
		[ space?.sources ]
	);

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
			if ( ! spaceId ) {
				return;
			}

			addSpaceSource(
				{ spaceId, subscription },
				{
					onSuccess: () =>
						dispatch(
							successNotice( translate( 'Source added to this space.' ), { duration: 5000 } )
						),
				}
			);
		},
		[ spaceId, addSpaceSource, dispatch, translate ]
	);
	const handleRemoveSource = useCallback(
		( subscription: SiteSubscriptionItem ) => {
			if ( ! spaceId ) {
				return;
			}

			deleteSpaceSource(
				{ spaceId, subscription },
				{
					onSuccess: () =>
						dispatch(
							successNotice( translate( 'Source removed from this space.' ), { duration: 5000 } )
						),
				}
			);
		},
		[ spaceId, deleteSpaceSource, dispatch, translate ]
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

	if ( ! isOpen ) {
		return null;
	}

	const selectedCount = space?.sources.length ?? 0;
	const sourcesState = getSourcesContentState( {
		isLoading: isSpaceLoading || siteSubscriptions.isLoading,
		isError: isSpaceError || siteSubscriptions.isError,
		isEmpty: filteredSubscriptions.length === 0,
	} );

	return (
		<Modal
			title={
				( space
					? translate( 'Sources for “%(spaceName)s”', { args: { spaceName: space.name } } )
					: translate( 'Sources' ) ) as string
			}
			size="large"
			onRequestClose={ onClose }
			className="sources-modal"
		>
			<VStack spacing={ 4 } justify="flex-start" className="sources-modal__body">
				<p className="sources-modal__description">
					{ translate( 'Choose which of your subscriptions appear in this space.' ) }
				</p>

				<SearchControl
					__nextHasNoMarginBottom
					label={ translate( 'Search your subscriptions' ) }
					value={ search }
					onChange={ ( value = '' ) => setSearch( value ) }
					placeholder={ translate( 'Search your subscriptions…' ) }
					className="sources-modal__search"
				/>

				<HStack justify="flex-start" spacing={ 2 } className="sources-modal__filters">
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

				<SourcesModalContent
					state={ sourcesState }
					filter={ filter }
					filteredSubscriptions={ filteredSubscriptions }
					renderSourceRow={ renderSourceRow }
					translate={ translate }
				/>
			</VStack>

			<HStack justify="space-between" className="sources-modal__footer">
				<div className="sources-modal__count">
					{ translate( '%(count)d sources in this space', {
						args: { count: selectedCount },
					} ) }
				</div>
				<Button __next40pxDefaultSize variant="primary" onClick={ onClose }>
					{ translate( 'Done' ) }
				</Button>
			</HStack>
		</Modal>
	);
}

type SourcesModalContentProps = {
	state: SourcesContentState;
	filter: Filter;
	filteredSubscriptions: SiteSubscriptionItem[];
	renderSourceRow: ( props: SourceRowRendererProps ) => React.ReactNode;
	translate: ReturnType< typeof useTranslate >;
};

function SourcesModalContent( {
	state,
	filter,
	filteredSubscriptions,
	renderSourceRow,
	translate,
}: SourcesModalContentProps ) {
	switch ( state ) {
		case 'loading':
			return <SourcesModalSkeleton label={ translate( 'Loading subscriptions' ) as string } />;
		case 'error':
			return (
				<p className="sources-modal__empty" role="alert">
					{ translate( 'We couldn’t load your subscriptions. Please try again.' ) }
				</p>
			);
		case 'empty':
			return (
				<p className="sources-modal__empty">
					{ filter === 'selected'
						? translate( 'No subscriptions added to this space yet.' )
						: translate( 'No subscriptions found.' ) }
				</p>
			);
		case 'list':
		default:
			return (
				<div className="sources-modal__list" role="list">
					<AutoSizer>
						{ ( { width, height }: { width: number; height: number } ) => (
							<List
								className="sources-modal__virtualized-list"
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

function SourcesModalSkeleton( { label }: { label: string } ) {
	return (
		<VStack
			spacing={ 3 }
			className="sources-modal__list"
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
					className="sources-modal__skeleton-row"
					style={ { minHeight: 56 } }
				>
					<Skeleton shape="circle" width="40px" height="40px" />
					<VStack spacing={ 2 } className="sources-modal__skeleton-text">
						<Skeleton width="180px" height="18px" />
						<Skeleton width="120px" height="14px" />
					</VStack>
					<Skeleton width="86px" height="40px" />
				</HStack>
			) ) }
		</VStack>
	);
}
