import { canonicalizeReadSpaceSlug } from '@automattic/api-core';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSpaceBySlug, useSpaces } from 'calypso/reader/data/spaces';
import { CustomizeModal, type CustomizeTab } from 'calypso/reader/spaces/customize-modal';
import { DEFAULT_SPACE_WIDTH } from 'calypso/reader/spaces/customize-modal/layout-tab';
import { SpaceFeed } from 'calypso/reader/spaces/feed';
import { DEFAULT_SPACE_FEED_LAYOUT } from 'calypso/reader/spaces/feed/layouts/registry';
import { SpaceError, isSpaceUnavailable } from 'calypso/reader/spaces/space-error';
import { SpaceNavigation } from 'calypso/reader/spaces/space-navigation';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { SpaceFeedLayout } from '@automattic/api-core';
import type { SpaceTab } from 'calypso/reader/spaces/routes';

import './style.scss';

interface Props {
	slug?: string;
	tab?: SpaceTab;
}

export function SpacesView( { slug, tab = 'feed' }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	// Resolve the space two ways. The list summary (already cached for the sidebar)
	// gives an instant header + layout by matching the slug, so the page paints and
	// the feed skeleton shows without waiting on a fetch. The by-slug detail call
	// runs in parallel: it reports a missing / renamed-away / not-yours slug via a
	// 404, and backs any slug not in the list (a deep link before the list loads).
	// Compare slugs canonically — the route slug is decoded, the API slug encoded.
	const spaces = useSpaces();
	const canonicalSlug = slug ? canonicalizeReadSpaceSlug( slug ) : undefined;
	const summary = canonicalSlug
		? spaces.find( ( item ) => canonicalizeReadSpaceSlug( item.slug ) === canonicalSlug )
		: undefined;
	const spaceQuery = useSpaceBySlug( slug );
	const space = summary ?? spaceQuery.data;
	const id = space?.id;
	const layoutView: SpaceFeedLayout = space?.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT;
	const isWide = ( space?.layout.width ?? DEFAULT_SPACE_WIDTH ) === 'wide';
	const icon = space?.layout.icon;
	const color = space?.layout.color;
	const title = space ? space.name : translate( 'Spaces' );
	// The generic "Spaces" heading belongs to the landing page only — while a
	// specific space is still loading, render no heading rather than flashing it.
	let headerTitle: string = '';
	if ( space ) {
		headerTitle = space.name;
	} else if ( ! slug ) {
		headerTitle = translate( 'Spaces' );
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
			recordReaderTracksEvent( 'calypso_reader_spaces_page_viewed', {
				space_id: id,
				layout: layoutView,
				icon,
				color,
				tab,
			} )
		);
	}, [ color, dispatch, icon, id, layoutView, tab ] );

	if ( slug && isSpaceUnavailable( spaceQuery.error ) ) {
		return <SpaceError slug={ slug } error={ spaceQuery.error } />;
	}

	let activePanel: ReactNode = null;
	if ( id && space ) {
		activePanel =
			tab === 'discover' ? (
				<SpaceFeed space={ space } onRetrySpace={ spaceQuery.refetch } variant="discover" />
			) : (
				<SpaceFeed
					space={ space }
					onRetrySpace={ spaceQuery.refetch }
					onAddSources={ () => {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_spaces_add_sources_clicked', {
								space_id: id,
							} )
						);
						setCustomizeTab( 'sources' );
					} }
				/>
			);
	}

	return (
		<ReaderMain className="reader-spaces" wideLayout={ isWide }>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the space name, or "Spaces" for the landing view',
					textOnly: true,
				} ) }
			/>
			<NavigationHeader
				title={ headerTitle }
				subtitle={ space ? translate( 'Your curated reading space' ) : undefined }
			>
				{ space ? (
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
			{ slug && space ? <SpaceNavigation spaceSlug={ slug } selectedTab={ tab } /> : null }
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
