import { canonicalizeReadShelfSlug } from '@automattic/api-core';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useShelfBySlug, useShelves } from 'calypso/reader/data/shelves';
import { CustomizeModal, type CustomizeTab } from 'calypso/reader/shelves/customize-modal';
import { DEFAULT_SHELF_WIDTH } from 'calypso/reader/shelves/customize-modal/layout-tab';
import { ShelfFeed } from 'calypso/reader/shelves/feed';
import { DEFAULT_SHELF_FEED_LAYOUT } from 'calypso/reader/shelves/feed/layouts/registry';
import { ShelfError, isShelfUnavailable } from 'calypso/reader/shelves/shelf-error';
import { ShelfNavigation } from 'calypso/reader/shelves/shelf-navigation';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { ShelfFeedLayout } from '@automattic/api-core';
import type { ShelfTab } from 'calypso/reader/shelves/routes';

import './style.scss';

interface Props {
	slug?: string;
	tab?: ShelfTab;
}

export function ShelvesView( { slug, tab = 'feed' }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	// Resolve the shelf two ways. The list summary (already cached for the sidebar)
	// gives an instant header + layout by matching the slug, so the page paints and
	// the feed skeleton shows without waiting on a fetch. The by-slug detail call
	// runs in parallel: it reports a missing / renamed-away / not-yours slug via a
	// 404, and backs any slug not in the list (a deep link before the list loads).
	// Compare slugs canonically — the route slug is decoded, the API slug encoded.
	const shelves = useShelves();
	const canonicalSlug = slug ? canonicalizeReadShelfSlug( slug ) : undefined;
	const summary = canonicalSlug
		? shelves.find( ( item ) => canonicalizeReadShelfSlug( item.slug ) === canonicalSlug )
		: undefined;
	const shelfQuery = useShelfBySlug( slug );
	const shelf = summary ?? shelfQuery.data;
	const id = shelf?.id;
	const layoutView: ShelfFeedLayout = shelf?.layout.view ?? DEFAULT_SHELF_FEED_LAYOUT;
	const isWide = ( shelf?.layout.width ?? DEFAULT_SHELF_WIDTH ) === 'wide';
	const icon = shelf?.layout.icon;
	const color = shelf?.layout.color;
	const title = shelf ? shelf.name : translate( 'Shelves' );
	// The generic "Shelves" heading belongs to the landing page only — while a
	// specific shelf is still loading, render no heading rather than flashing it.
	let headerTitle: string = '';
	if ( shelf ) {
		headerTitle = shelf.name;
	} else if ( ! slug ) {
		headerTitle = translate( 'Shelves' );
	}
	// Which tab the unified Customize modal opens on, or `null` when it's closed.
	const [ customizeTab, setCustomizeTab ] = useState< CustomizeTab | null >( null );

	const handleClose = () => {
		setCustomizeTab( null );
	};

	useEffect( () => {
		if ( ! id || ! icon || ! color ) {
			return;
		}

		dispatch(
			recordReaderTracksEvent( 'calypso_reader_shelves_page_viewed', {
				shelf_id: id,
				layout: layoutView,
				icon,
				color,
				tab,
			} )
		);
	}, [ color, dispatch, icon, id, layoutView, tab ] );

	if ( slug && isShelfUnavailable( shelfQuery.error ) ) {
		return <ShelfError slug={ slug } error={ shelfQuery.error } />;
	}

	let activePanel: ReactNode = null;
	if ( id && shelf ) {
		activePanel =
			tab === 'discover' ? (
				<ShelfFeed shelf={ shelf } onRetryShelf={ shelfQuery.refetch } variant="discover" />
			) : (
				<ShelfFeed
					shelf={ shelf }
					onRetryShelf={ shelfQuery.refetch }
					onAddSources={ () => {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_shelves_add_sources_clicked', {
								shelf_id: id,
							} )
						);
						setCustomizeTab( 'sources' );
					} }
				/>
			);
	}

	return (
		<ReaderMain className="reader-shelves" wideLayout={ isWide }>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the shelf name, or "Shelves" for the landing view',
					textOnly: true,
				} ) }
			/>
			<NavigationHeader
				title={ headerTitle }
				subtitle={ shelf ? translate( 'Your curated reading shelf' ) : undefined }
			>
				{ shelf ? (
					<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							icon={ settings }
							onClick={ () => setCustomizeTab( 'identity' ) }
						>
							{ translate( 'Customize' ) }
						</Button>
					</HStack>
				) : null }
			</NavigationHeader>
			{ slug && shelf ? <ShelfNavigation shelfSlug={ slug } selectedTab={ tab } /> : null }
			{ activePanel }
			<CustomizeModal
				isOpen={ customizeTab !== null }
				slug={ slug ?? null }
				initialTab={ customizeTab ?? 'identity' }
				onClose={ handleClose }
			/>
		</ReaderMain>
	);
}
