import {
	getReadSpaceSourceKey,
	getSiteSubscriptionSourceKey,
	type SiteSubscriptionItem,
} from '@automattic/api-core';
import { AutoSizer, List } from '@automattic/react-virtualized';
import {
	Button,
	Modal,
	SearchControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Skeleton from 'calypso/reader/components/skeleton';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { useAddSpaceSource, useDeleteSpaceSource, useSpaces } from 'calypso/reader/data/spaces';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
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

const SOURCE_ROW_HEIGHT = 64;
const SOURCE_ROW_GAP = 8;

type SourceRowRendererProps = {
	index: number;
	key: string;
	style: CSSProperties;
};

const getSubscriptionSearchText = ( subscription: SiteSubscriptionItem ): string =>
	[
		subscription.name,
		subscription.URL,
		subscription.feed_URL,
		formatUrlForDisplay( subscription.URL || subscription.feed_URL ),
	]
		.filter( Boolean )
		.join( ' ' )
		.toLowerCase();

export function SourcesModal( { isOpen, spaceId, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const spaces = useSpaces();
	const space = spaces.find( ( item ) => item.id === spaceId );
	const activeSpaceId = space?.id;
	const siteSubscriptions = useSiteSubscriptions( { fetchAllPages: true } );
	const { mutate: addSpaceSource } = useAddSpaceSource();
	const { mutate: deleteSpaceSource } = useDeleteSpaceSource();

	const [ filter, setFilter ] = useState< Filter >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ hasChangedSources, setHasChangedSources ] = useState( false );

	useEffect( () => {
		if ( isOpen ) {
			setHasChangedSources( false );
		}
	}, [ isOpen, spaceId ] );

	const selectedKeys = useMemo(
		() => new Set( ( space?.sources ?? [] ).map( ( source ) => getReadSpaceSourceKey( source ) ) ),
		[ space?.sources ]
	);

	const filteredSubscriptions = useMemo( () => {
		const normalizedSearch = search.trim().toLowerCase();

		return siteSubscriptions.subscriptions.filter( ( subscription ) => {
			const isSelected = selectedKeys.has( getSiteSubscriptionSourceKey( subscription ) );

			if ( filter === 'selected' && ! isSelected ) {
				return false;
			}

			if (
				normalizedSearch &&
				! getSubscriptionSearchText( subscription ).includes( normalizedSearch )
			) {
				return false;
			}

			return true;
		} );
	}, [ filter, search, selectedKeys, siteSubscriptions.subscriptions ] );
	const handleDone = useCallback( () => {
		if ( hasChangedSources ) {
			dispatch( successNotice( translate( 'Sources saved.' ), { duration: 5000 } ) );
		}
		onClose();
	}, [ dispatch, hasChangedSources, onClose, translate ] );
	const handleAddSource = useCallback(
		( subscription: SiteSubscriptionItem ) => {
			if ( ! activeSpaceId ) {
				return;
			}

			setHasChangedSources( true );
			addSpaceSource( { spaceId: activeSpaceId, subscription } );
		},
		[ activeSpaceId, addSpaceSource ]
	);
	const handleRemoveSource = useCallback(
		( subscription: SiteSubscriptionItem ) => {
			if ( ! activeSpaceId ) {
				return;
			}

			setHasChangedSources( true );
			deleteSpaceSource( { spaceId: activeSpaceId, subscription } );
		},
		[ activeSpaceId, deleteSpaceSource ]
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

	if ( ! isOpen || ! space ) {
		return null;
	}

	const selectedCount = space.sources.length;
	let sourcesContent;

	if ( siteSubscriptions.isLoading ) {
		sourcesContent = (
			<SourcesModalSkeleton label={ translate( 'Loading subscriptions' ) as string } />
		);
	} else if ( filteredSubscriptions.length > 0 ) {
		sourcesContent = (
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
	} else {
		sourcesContent = (
			<p className="sources-modal__empty">
				{ filter === 'selected'
					? translate( 'No subscriptions added to this space yet.' )
					: translate( 'No subscriptions found.' ) }
			</p>
		);
	}

	return (
		<Modal
			title={
				translate( 'Sources for “%(spaceName)s”', {
					args: { spaceName: space.name },
				} ) as string
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

				{ sourcesContent }
			</VStack>

			<HStack justify="space-between" className="sources-modal__footer">
				<div className="sources-modal__count">
					{ translate( '%(count)d sources in this space', {
						args: { count: selectedCount },
					} ) }
				</div>
				<Button __next40pxDefaultSize variant="primary" onClick={ handleDone }>
					{ translate( 'Done' ) }
				</Button>
			</HStack>
		</Modal>
	);
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
